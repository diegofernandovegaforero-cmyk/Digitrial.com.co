import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
        const { email, instruccion_texto, audio_base64 } = await req.json();

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

        const codigoActual = userData.codigo_actual || '';
        const nuevosCreditos = creditos - 3;

        // ── Transcripción de audio (si aplica) ──
        let transcripcion_audio = '';
        if (audio_base64 && apiKey) {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
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

INSTRUCCIÓN DE AUDIO (PRIORIDAD ABSOLUTA): "${transcripcion_audio}"
INSTRUCCIÓN DE TEXTO: "${instruccion_texto}"
(Nota: Si existe instrucción de audio y contradice a la de texto, DEBES obedecer ÚNICAMENTE al audio. Si son complementarias, úsalas juntas. Si solo hay una, usa esa).

CRÉDITOS RESTANTES DEL CLIENTE (después de esta edición): ${nuevosCreditos}

REGLAS ESTRICTAS DE SALIDA:
- Devuelve SOLO el HTML completo modificado.
- PROHIBIDO usar Markdown. NO uses \`\`\`html ni \`\`\`.
- Tu respuesta debe comenzar EXACTAMENTE con <!DOCTYPE html> y terminar con </html>.
- Mantén TODAS las secciones existentes a menos que el cliente pida eliminarlas expresamente.
- ¡CRÍTICO Y VITAL! SI AGREGAS O MODIFICAS IMÁGENES, DEBES IMPLEMENTAR UN SISTEMA DE DOS RUTINES:
  1. 'src' principal: https://image.pollinations.ai/prompt/[descripcion-en-ingles]?width=[ancho]&height=[alto]&nologo=true (REEMPLAZA ESPACIOS POR GUIONES '-').
  2. 'onerror' de respaldo OBLIGATORIO: onerror="this.onerror=null; this.src='https://loremflickr.com/1600/900/[palabra_clave_1],[palabra_clave_2]/all';" (REEMPLAZA ESPACIOS POR COMAS ',').
  Ejemplo: <img src="https://image.pollinations.ai/prompt/office-modern-team?width=1600&height=900&nologo=true" onerror="this.onerror=null; this.src='https://loremflickr.com/1600/900/office,modern/all';" ...>
- ¡VIDEOS DE STOCK (Stick de vids)! Si necesitas fondos en video, usa <video autoplay loop muted playsinline>: https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-4174-large.mp4 o https://assets.mixkit.co/videos/preview/mixkit-people-in-a-business-meeting-working-on-a-project-4180-large.mp4 o https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-laptop-in-a-coffee-shop-4171-large.mp4 o https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-connection-background-27202-large.mp4
- ¡CRÍTICO! NO ELIMINES NI REEMPLACES las imágenes de fondo (<img> o background-image) por simples gradientes o colores estáticos. Mantén el diseño rico y estructurado con una paleta de colores adaptada al giro del negocio.
- ¡ATENCIÓN A LOS COLORES! La paleta de colores (oscuro, claro, colores específicos) DEBE estar estrictamente condicionada por la instrucción de audio o texto. Si el cliente pide colores claros, quita el dark mode; si pide colores específicos, aplícalos en el CSS.
- Mantén el carácter dinámico de la página web (GSAP, AOS, Framer Motion, microinteracciones, animaciones de entrada).
- ¡ELIMINA CUALQUIER PANTALLA DE CARGA (LOADING SCREEN)! Si el código actual tiene un preloader, spinner, overlay oscuro o pantalla de carga (con 0-100%, opacidad 0 inicial, etc.), ELIMÍNALO por completo en tu respuesta. El sitio debe mostrarse y renderizarse inmediatamente sin retrasos.
- Alerta al final: Si los créditos restantes mencionados arriba son 0 o 3, DEBES incluir un banner sutil, elegante y muy premium pegado encima del footer actual que diga exactamente: "Atención: Te quedan {{creditos_restantes}} créditos de edición. Contacta a un asesor para llevar este diseño a producción o recargar tu cuenta." Reemplaza {{creditos_restantes}} por el número real.

Ejecuta los cambios solicitados sobre el código HTML respetando las paletas de colores pedidas y devuelve el nuevo documento renderizado.
        `.trim();

        if (!apiKey) {
            return NextResponse.json({ error: 'API key de Gemini no configurada.' }, { status: 503 });
        }

        const customGoogle = createGoogleGenerativeAI({
            apiKey: apiKey,
        });

        const result = streamText({
            model: customGoogle('gemini-2.5-pro'),
            prompt: promptEdicion,
            onFinish: async ({ text }) => {
                const nuevoHtml = text.replace(/```html/gi, '').replace(/```/g, '').trim();
                const dbForUpdate = getAdminDbSafe();
                if (dbForUpdate) {
                    await dbForUpdate.collection('usuarios_leads').doc(docRef.id).update({
                        codigo_actual: nuevoHtml,
                        creditos_restantes: nuevosCreditos,
                        ultima_edicion: new Date().toISOString(),
                        instruccion_texto: instruccion_texto || '',
                        transcripcion_audio: transcripcion_audio || '',
                    });
                }
            },
        });

        // Retornamos el stream. Adicionalmente, podríamos retornar cabeceras extra si se necesitan.
        return result.toTextStreamResponse({
            headers: {
                'x-transcripcion-audio': Buffer.from(transcripcion_audio).toString('base64'),
                'x-creditos-restantes': nuevosCreditos.toString()
            }
        });

    } catch (error) {
        console.error('Error editando página:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
