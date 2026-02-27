import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAdminDbSafe } from '@/lib/firebase-admin';

// Sanitizar email igual que en el frontend
const emailToDocId = (email: string) =>
    email.toLowerCase().trim().replace(/[.#$[\]]/g, '_');

export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;

    // Verificar Firebase
    const db = getAdminDbSafe();
    if (!db) {
        return NextResponse.json({ error: 'Firebase no configurado en el servidor.' }, { status: 503 });
    }

    try {
        const { email, instruccion_texto, audio_base64 } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Se requiere el correo electrónico.' }, { status: 400 });
        }

        const docId = emailToDocId(email);
        const docRef = db.collection('usuarios_leads').doc(docId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ error: 'Usuario no encontrado. Genera primero tu página web.' }, { status: 404 });
        }

        const userData = docSnap.data()!;
        const creditos = userData.creditos_restantes ?? 0;

        if (creditos < 3) {
            return NextResponse.json(
                { error: 'Créditos insuficientes. Contacta a un asesor para recargar.', creditos_restantes: creditos },
                { status: 402 }
            );
        }

        const codigoActual = userData.codigo_actual || '';

        // ── Transcripción de audio (si aplica) ──
        let transcripcion_audio = '';
        if (audio_base64 && apiKey) {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const audioResult = await model.generateContent([
                    { text: 'Transcribe exactamente el siguiente audio en español. Solo devuelve el texto transcrito, sin explicaciones:' },
                    { inlineData: { mimeType: 'audio/webm', data: audio_base64 } },
                ]);
                transcripcion_audio = audioResult.response.text().trim();
            } catch (err) {
                console.warn('Error transcribiendo audio:', err);
            }
        }

        // ── Construir instrucción final ──
        const instruccionFinal = transcripcion_audio || instruccion_texto || '';
        if (!instruccionFinal.trim()) {
            return NextResponse.json({ error: 'No se recibió ninguna instrucción de edición.' }, { status: 400 });
        }

        // ── Prompt Maestro de Edición ──
        const promptEdicion = `
Eres el Desarrollador Front-End Senior de Digitrial centro de soluciones.

Se te entrega el código HTML actual de una landing page y una instrucción del cliente para modificarla.

CÓDIGO HTML ACTUAL:
${codigoActual}

INSTRUCCIÓN DEL CLIENTE:
"${instruccionFinal}"

CRÉDITOS RESTANTES DEL CLIENTE (después de esta edición): ${creditos - 3}

REGLAS ESTRICTAS DE SALIDA:
- Devuelve SOLO el HTML completo modificado.
- PROHIBIDO usar Markdown. NO uses \`\`\`html ni \`\`\`.
- Tu respuesta debe comenzar EXACTAMENTE con <!DOCTYPE html> y terminar con </html>.
- Mantén TODAS las secciones existentes a menos que el cliente pida eliminarlas expresamente.
- ¡CRÍTICO! NO ELIMINES NI REEMPLACES las imágenes de fondo de Unsplash (<img src="..."> o background-image: url(...)) por simples gradientes o fondos estáticos. Mantén el diseño rico y estructurado.
- ¡CRÍTICO! MANTÉN el carácter dinámico de la página web (microinteracciones, animaciones de entrada, efectos hover). Nunca estaticices el diseño.
- Si el cliente menciona colores, aplícalos. Si menciona textos, cámbialos exactamente.
- Mantén Tailwind CSS CDN, animaciones y el diseño responsivo.
        `.trim();

        if (!apiKey) {
            return NextResponse.json({ error: 'API key de Gemini no configurada.' }, { status: 503 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(promptEdicion);
        let nuevoHtml = result.response.text()
            .replace(/```html\n?/gi, '')
            .replace(/```\n?/g, '')
            .trim();

        // ── Actualizar Firestore atómicamente ──
        const dbForUpdate = getAdminDbSafe();
        if (dbForUpdate) {
            await dbForUpdate.collection('usuarios_leads').doc(docId).update({
                codigo_actual: nuevoHtml,
                creditos_restantes: creditos - 3,
                ultima_edicion: new Date().toISOString(),
                instruccion_texto: instruccion_texto || '',
                transcripcion_audio: transcripcion_audio || '',
            });
        }

        return NextResponse.json({
            html: nuevoHtml,
            creditos_restantes: creditos - 3,
            transcripcion_audio,
        });

    } catch (error) {
        console.error('Error editando página:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
