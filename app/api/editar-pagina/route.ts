import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { getAdminDbSafe } from '@/lib/firebase-admin';

// Sanitizar email igual que en el frontend
const emailToDocId = (email: string) =>
    email.toLowerCase().trim().replace(/[.#$[\\]]/g, '_');

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;

    // Verificar Firebase
    const db = getAdminDbSafe();
    if (!db) {
        return NextResponse.json({ error: 'Firebase no configurado en el servidor.' }, { status: 503 });
    }

    try {
        const { email, instruccion_texto, id_diseno_base, audio_base64, imagenes_base64 } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Se requiere el correo electrónico.' }, { status: 400 });
        }

        const docId = emailToDocId(email);
        let docRef = db.collection('usuarios_leads').doc(docId);
        let docSnap = await docRef.get();

        // ── Compatibilidad hacia atrás: Si no existe por email, buscar por UID de Firebase ──
        if (!docSnap.exists) {
            // Asumimos que si no lo encuentra, tal vez la página se haya generado ANTES de nuestra 
            // actualización que unifica los IDs por email. Busquemos un documento cuyo campo 'email' coincida.
            const querySnapshot = await db.collection('usuarios_leads').where('email', '==', email.toLowerCase().trim()).limit(1).get();
            if (!querySnapshot.empty) {
                docRef = querySnapshot.docs[0].ref;
                docSnap = await docRef.get();
            } else {
                return NextResponse.json({ error: 'Usuario no encontrado. Genera primero tu página web.' }, { status: 404 });
            }
        }

        const userData = docSnap.data()!;
        const creditos = userData.creditos_restantes ?? 0;

        if (creditos < 3) {
            return NextResponse.json(
                { error: 'Créditos insuficientes. Contacta a un asesor para recargar.', creditos_restantes: creditos },
                { status: 402 }
            );
        }

        // Si el usuario seleccionó un diseño antiguo del historial, lo buscamos en la subcolección
        let codigoActual = userData.codigo_actual || '';
        if (id_diseno_base) {
            try {
                const historyRef = db.collection('usuarios_leads').doc(docId).collection('historial_codigos').doc(id_diseno_base);
                const historySnap = await historyRef.get();
                if (historySnap.exists) {
                    codigoActual = historySnap.data()?.codigo_html || '';
                }
            } catch (historyErr) {
                console.warn('Error fetching historical code, falling back to current:', historyErr);
            }
        }

        const nuevosCreditos = creditos - 3;

        // ── Construir instrucción final ──
        const instruccionFinal = instruccion_texto || '';
        if (!instruccionFinal.trim()) {
            return NextResponse.json({ error: 'No se recibió ninguna instrucción de edición.' }, { status: 400 });
        }

        // Detectar y preservar imágenes en base64 existentes para no perderlas
        const mapImagenesExistentes = new Map<string, string>();
        let contadorImg = 0;
        let codigoParaGemini = codigoActual.replace(/src="(data:image\/[^;]+;base64,[^"]+)"/gi, (match: string, b64: string) => {
            contadorImg++;
            const placeholder = `EXISTING_IMG_${contadorImg}`;
            mapImagenesExistentes.set(placeholder, b64);
            return `src="${placeholder}"`;
        });

        // Cap de seguridad
        codigoParaGemini = codigoParaGemini.slice(0, 250000);

        // ── Prompt Maestro de Edición ──
        const promptEdicion = `
Eres el Desarrollador Front-End Senior de Digitrial centro de soluciones.

Se te entrega el código HTML actual de una landing page y una instrucción del cliente para modificarla.

IMPORTANTE - REGLA DE IMÁGENES:
Si vas a agregar o reemplazar imágenes, está ESTRICTAMENTE PROHIBIDO usar Unsplash, Pollinations u otros. Tu ÚNICO proveedor de imágenes es nuestro proxy interno de Pexels.
Usa EXACTAMENTE esta estructura para el 'src' de la imagen:
<img src="/api/pexels?q=[palabras+clave+en+ingles+separadas+por+signo+mas]" alt="..." class="...">

CÓDIGO HTML ACTUAL:
${codigoParaGemini}

INSTRUCCIÓN DE CLIENTE: "${instruccion_texto}"

CRÉDITOS RESTANTES DEL CLIENTE (después de esta edición): ${nuevosCreditos}

REGLAS ESTRICTAS DE SALIDA:
- Devuelve SOLO el HTML completo modificado.
- PROHIBIDO usar Markdown. NO uses \`\`\`html ni \`\`\`.
- Tu respuesta debe comenzar EXACTAMENTE con <!DOCTYPE html> y terminar con </html>.
- Mantén TODAS las secciones existentes a menos que el cliente pida eliminarlas expresamente.
- ¡CRÍTICO Y VITAL! SI AGREGAS O MODIFICAS IMÁGENES, DEBES UTILIZAR ÚNICAMENTE NUESTRO PROXY DE PEXELS COMO PROVEEDOR PROFESIONAL:
  1. 'src' principal (SISTEMA PREMIUM - PROVEEDOR UNICO): /api/pexels?q=[palabras+clave+en+ingles+separadas+por+signo+mas]
  ¡ESTÁ TERMINANTEMENTE PROHIBIDO usar Unsplash, Pollinations, Nano Banana o LoremFlickr! Confía en el proxy de Pexels.
  Ejemplo: <img src="/api/pexels?q=office+modern+team" alt="Equipo profesional">
- ¡VIDEOS DE STOCK (Stick de vids)! Si necesitas fondos en video, usa <video autoplay loop muted playsinline>: https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-4174-large.mp4 o https://assets.mixkit.co/videos/preview/mixkit-people-in-a-business-meeting-working-on-a-project-4180-large.mp4 o https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-laptop-in-a-coffee-shop-4171-large.mp4 o https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-connection-background-27202-large.mp4
- ¡CRÍTICO! NO ELIMINES NI REEMPLACES las imágenes de fondo (<img> o background-image) por simples gradientes o colores estáticos. Mantén el diseño rico y estructurado con una paleta de colores adaptada al giro del negocio.
- ¡ATENCIÓN A LOS COLORES! La paleta de colores (oscuro, claro, colores específicos) DEBE estar estrictamente condicionada por la instrucción de audio o texto. Si el cliente pide colores claros, quita el dark mode; si pide colores específicos, aplícalos en el CSS.
- Mantén el carácter dinámico de la página web (GSAP, AOS, Framer Motion, microinteracciones, animaciones de entrada).
- Alerta al final: Si los créditos restantes mencionados arriba son 0 o 3, DEBES incluir un banner sutil, elegante y muy premium pegado encima del footer actual que diga exactamente: "Atención: Te quedan {{creditos_restantes}} créditos de edición. Contacta a un asesor para llevar este diseño a producción o recargar tu cuenta." Reemplaza {{creditos_restantes}} por el número real.
- FOOTER Y DERECHOS RESERVADOS: Asegúrate de que el diseño final SIEMPRE contenga un Footer profesional. En la parte inferior, DEBES escribir exactamente el símbolo de Copyright seguido del año actual y la frase de derechos reservados de esta forma: "© ${new Date().getFullYear()} Todos los derechos reservados", acompañado del nombre de la marca o empresa generada.

Ejecuta los cambios solicitados sobre el código HTML respetando las paletas de colores pedidas y devuelve el nuevo documento renderizado.
        `.trim();

        if (!apiKey) {
            return NextResponse.json({ error: 'API key de Gemini no configurada.' }, { status: 503 });
        }

        const customGoogle = createGoogleGenerativeAI({
            apiKey: apiKey,
        });

        const userContent: any[] = [{ type: 'text', text: promptEdicion }];

        // Adjuntar imágenes de referencia si las hay
        let placeholdersEdicion = "";
        if (Array.isArray(imagenes_base64) && imagenes_base64.length > 0) {
            imagenes_base64.forEach((imgBase64: string, idx) => {
                const match = imgBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/i);
                const mimeType = match ? match[1] : 'image/jpeg';
                const base64Data = match ? match[2] : imgBase64.replace(/^data:image\/\w+;base64,/, '');
                userContent.push({
                    type: 'image',
                    image: Buffer.from(base64Data, 'base64'),
                    mimeType,
                });
                placeholdersEdicion += `UPLOADED_IMG_${idx + 1}\n`;
            });
            
            userContent.push({
                type: 'text',
                text: `\n\n¡ALERTA CRÍTICA PARA IMÁGENES Y LOGOS!: El usuario ha adjuntado imágenes reales para la edición (que estás viendo). 
1. DEBES incorporarlas en el HTML ubicándolas donde el usuario indicó usando EXACTAMENTE estos identificadores literales en el 'src' de la etiqueta <img>:\n${placeholdersEdicion}\nEjemplo: <img src="UPLOADED_IMG_1" class="...">. (Para OTRAS imágenes extra sigue usando /api/pexels).
2. ¡ATENCIÓN AL LOGO Y COLORES!: Si el usuario te indica en las instrucciones que alguna de estas imágenes ES UN LOGO, DEBES colocarla en la barra de navegación (Header) reemplazando al logo anterior. ADEMÁS, DEBES analizar visualmente ese logo y extraer sus COLORES PREDOMINANTES para recodificar toda la Paleta de Colores del sitio (textos, botones, fondos) basándote estrictamente en ellos.`
            });
        }

        const result = streamText({
            model: customGoogle('gemini-3.1-pro'),
            messages: [{ role: 'user', content: userContent }],
            onFinish: async ({ text }) => {
                let nuevoHtml = text.replace(/```html/gi, '').replace(/```/g, '').trim();
                
                // RESTAURACIÓN DE IMÁGENES:
                // 1. Restaurar imágenes que ya existían (las preservadas antes)
                mapImagenesExistentes.forEach((b64, placeholder) => {
                    nuevoHtml = nuevoHtml.split(placeholder).join(b64);
                });

                // 2. Restaurar nuevas imágenes subidas en esta edición
                if (Array.isArray(imagenes_base64) && imagenes_base64.length > 0) {
                    imagenes_base64.forEach((b64, idx) => {
                        nuevoHtml = nuevoHtml.split(`UPLOADED_IMG_${idx + 1}`).join(b64);
                    });
                }
                
                const dbForUpdate = getAdminDbSafe();
                if (dbForUpdate) {
                    const historyId = Date.now().toString();
                    const newDesignMetadata = {
                        id: historyId,
                        descripcion: instruccion_texto ? instruccion_texto.substring(0, 200) : 'Edición de texto',
                        fecha: new Date().toISOString(),
                        has_separate_code: true
                    };

                    // 1. Guardar código en subcolección (PESADO)
                    await dbForUpdate.collection('usuarios_leads').doc(docRef.id).collection('historial_codigos').doc(historyId).set({
                        codigo_html: nuevoHtml,
                        fecha: new Date().toISOString()
                    });

                    // 2. Metadata en doc principal
                    let historial = userData.historial_disenos || [];

                    // Migración silenciosa
                    if (historial.length === 0 && userData.codigo_actual) {
                        historial.push({
                            id: (Date.now() - 1000).toString(),
                            codigo_actual: userData.codigo_actual,
                            descripcion: userData.descripcion || 'Diseño base',
                            fecha: userData.ultima_edicion || userData.fecha_creacion || new Date().toISOString()
                        });
                    }

                    historial.unshift(newDesignMetadata);
                    historial = historial.slice(0, 10); // Aumentar límite ya que es ligero

                    await dbForUpdate.collection('usuarios_leads').doc(docRef.id).update({
                        codigo_actual: nuevoHtml,
                        historial_disenos: historial,
                        creditos_restantes: nuevosCreditos,
                        ultima_edicion: new Date().toISOString(),
                        instruccion_texto: instruccion_texto || '',
                    });
                }
            },
        });

        // Retornamos el stream. Adicionalmente, podríamos retornar cabeceras extra si se necesitan.
        return result.toTextStreamResponse({
            headers: {
                'x-creditos-restantes': nuevosCreditos.toString()
            }
        });

    } catch (error) {
        console.error('Error editando página:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
