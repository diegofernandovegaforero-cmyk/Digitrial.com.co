import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Firebase Admin helper
const getAdminDb = async () => {
    if (!process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID === 'TU_PROYECTO_ID') {
        return null;
    }
    const { getAdminDbSafe } = await import('@/lib/firebase-admin');
    return getAdminDbSafe();
};

export const maxDuration = 60;

const buildPrompt = (input: string) => `
AGENTE: GEMINI 3.5 FLASH
ROL: Desarrollador Web Senior y Diseñador UI/UX.
TAE: Generar una LANDING PAGE comercial de ALTO IMPACTO y Premium basándote en la siguiente descripción.

DESCRIPCIÓN DEL NEGOCIO:
"${input}"

REGLAS DE DISEÑO (ESTRICTAS):
1. Usa HTML5 semántico y CSS moderno (puedes usar Tailwind via CDN si lo deseas).
2. Estética: Moderna, limpia, con tipografía elegante (usa Google Fonts como Inter o Montserrat). Incluye animaciones suaves.
3. Secciones obligatorias: Hero con CTA claro, Servicios/Beneficios, Galería/Muestra, Testimonios y Pie de página con formulario de contacto.
4. **LOGOS E ICONOS:** Diseña un logo creativo y minimalista usando **código SVG directo**. Si el cliente no aporta un logo, CREA uno proporcional y estético con código SVG.
5. Imágenes: Usa imágenes de stock profesionales (de Pexels o Unsplash) que encajen con el nicho.
6. Interactividad: Asegúrate de que los botones tengan efectos hover y que el diseño sea 100% responsivo.

REGLAS DE SALIDA:
- Devuelve ÚNICAMENTE el código HTML completo.
- NO uses bloques de Markdown (\`\`\`html).
- Comienza con <!DOCTYPE html> y termina con </html>.
- NO incluyas explicaciones ni texto fuera del código.
- PROHIBIDO imágenes generadas por IA (bitmaps), usa solo imágenes de stock o SVG.
`;

export async function POST(req: NextRequest) {
    try {
        const { email, descripcion, nombre_contacto, imagenes_base64, rid } = await req.json();

        if (!descripcion) {
            return NextResponse.json({ error: 'La descripción es obligatoria.' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const inputUsuario = descripcion;

        // --- VERIFICACIÓN PREVENTIVA DE CRÉDITOS (SOLO LECTURA) ---
        let creditosActuales = 6;
        try {
            const adminDb = await getAdminDb();
            if (adminDb && email) {
                const emailKey = email.toLowerCase().trim().replace(/[.#$[\]]/g, '_');
                const docRef = adminDb.collection('maquetasweb_usuarios').doc(emailKey);
                const existing = await docRef.get();

                if (existing.exists) {
                    const data = existing.data() || {};
                    creditosActuales = data.creditos_restantes || 0;
                    if (creditosActuales < 1) {
                        return NextResponse.json({ error: 'Créditos insuficientes (1 crédito por generación).' }, { status: 402 });
                    }
                }
            }
        } catch (err) {
            console.warn("Fallo verificación inicial:", err);
        }

        if (!apiKey || apiKey === 'PEGA_TU_API_KEY_AQUI') {
            return NextResponse.json({ error: 'API Key no configurada' }, { status: 500 });
        }

        const customGoogle = createGoogleGenerativeAI({ apiKey });
        const promptText = buildPrompt(inputUsuario);
        const userContent: any[] = [{ type: 'text', text: promptText }];

        if (Array.isArray(imagenes_base64) && imagenes_base64.length > 0) {
            let placeholders = "";
            imagenes_base64.forEach((img, idx) => {
                const base64Data = img.replace(/^data:image\/\w+;base64,/, '');
                userContent.push({
                    type: 'image',
                    image: Buffer.from(base64Data, 'base64'),
                    mimeType: 'image/jpeg'
                });
                placeholders += `UPLOADED_IMG_${idx + 1}\n`;
            });
            userContent.push({ type: 'text', text: `\n\nIMÁGENES ADJUNTAS:\n${placeholders}` });
        }

        const result = await streamText({
            model: customGoogle('gemini-1.5-flash-latest'),
            messages: [{ role: 'user', content: userContent }],
            onFinish: async ({ text }) => {
                console.log(`[GENERACIÓN] Stream completado para ${email}. Iniciando guardado y cobro...`);
                let html = text.replace(/```html/gi, '').replace(/```/g, '').trim();

                if (Array.isArray(imagenes_base64) && imagenes_base64.length > 0) {
                    imagenes_base64.forEach((b64, idx) => {
                        html = html.split(`UPLOADED_IMG_${idx + 1}`).join(b64);
                    });
                }

                if (email) {
                    try {
                        const adminDb = await getAdminDb();
                        if (adminDb) {
                            const emailKey = email.toLowerCase().trim().replace(/[.#$[\]]/g, '_');
                            const docRef = adminDb.collection('maquetasweb_usuarios').doc(emailKey);
                            const { getAdminFieldValue } = await import('@/lib/firebase-admin');
                            const FieldValue = getAdminFieldValue();
                            
                            const userDoc = await docRef.get();
                            const historyId = Date.now().toString();

                            // 1. Guardar en historial_codigos
                            await docRef.collection('historial_codigos').doc(historyId).set({
                                codigo_html: html,
                                fecha: new Date().toISOString()
                            });

                            if (!userDoc.exists) {
                                // USUARIO NUEVO: 6 iniciales - 1 consumido = 5 finales
                                await docRef.set({
                                    email: email.toLowerCase().trim(),
                                    nombre_contacto: nombre_contacto || '',
                                    creditos_restantes: 5,
                                    fecha_creacion: new Date().toISOString(),
                                    last_rid: rid || null,
                                    historial_disenos: [{
                                        id: historyId,
                                        descripcion: (descripcion || '').substring(0, 200),
                                        fecha: new Date().toISOString(),
                                        has_separate_code: true
                                    }],
                                    codigo_actual: Buffer.byteLength(html, 'utf8') < 800000 ? html : null
                                });
                                console.log(`[GENERACIÓN] Usuario nuevo creado con 6 iniciales (queda en 5) para ${email}`);
                            } else {
                                // USUARIO EXISTENTE: Descuento atómico de 1 crédito
                                const userData = userDoc.data() || {};
                                
                                // Idempotencia: No cobrar si ya se procesó este rid
                                if (rid && userData.last_rid === rid) {
                                    console.log(`[GENERACIÓN] Rid ${rid} ya cobrado. Saltando.`);
                                    return;
                                }

                                let historial = userData.historial_disenos || [];
                                const meta = {
                                    id: historyId,
                                    descripcion: (descripcion || '').substring(0, 200),
                                    fecha: new Date().toISOString(),
                                    has_separate_code: true
                                };
                                historial = [meta, ...historial].slice(0, 10);

                                const updateData: any = {
                                    creditos_restantes: FieldValue.increment(-1),
                                    last_rid: rid || null,
                                    ultima_generacion: new Date().toISOString(),
                                    historial_disenos: historial
                                };

                                if (Buffer.byteLength(html, 'utf8') < 800000) {
                                    updateData.codigo_actual = html;
                                }

                                await docRef.update(updateData);
                                console.log(`[GENERACIÓN] Cobro de 1 crédito realizado para ${email}`);
                            }
                        }
                    } catch (e) {
                         console.error("[GENERACIÓN] Error en onFinish (guardado/cobro):", e);
                    }
                }
            }
        });

        return result.toTextStreamResponse({
            headers: { 'x-creditos-restantes': creditosActuales.toString() }
        });

    } catch (error: any) {
        console.error('Error generando página:', error);
        return NextResponse.json({ error: error.message || 'Error generando la página' }, { status: 500 });
    }
}
