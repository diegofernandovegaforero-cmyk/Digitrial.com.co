import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAdminDbSafe } from '@/lib/firebase-admin';


const CREDITOS_POR_EDICION = 3;

const buildEditPrompt = (
    codigoActual: string,
    instruccionTexto: string,
    transcripcionAudio: string,
    creditosRestantes: number
) => `
Rol:
Actúa como Desarrollador Web Front-End Senior de Digitrial centro de soluciones. Tu objetivo es modificar y perfeccionar una maqueta web existente (en HTML y Tailwind CSS) basándote estrictamente en las nuevas instrucciones del cliente.

Código Base Actual:
${codigoActual}

Instrucción en Texto (máx 500 caracteres):
${instruccionTexto || '(Ninguna)'}

Instrucción por Audio (Transcripción):
${transcripcionAudio || '(Ninguna)'}

Créditos Restantes Post-Edición: ${creditosRestantes}

Instrucciones de Edición:
1. Lee el "Código Base Actual" y aplica ÚNICAMENTE los cambios solicitados. No reescribas secciones que el usuario no ha pedido alterar.
2. Si el texto y el audio piden cosas contradictorias, dale prioridad absoluta al audio.
3. Mantén el diseño responsivo (md:, lg:) y usa paletas de colores modernas de Tailwind.
4. Si ${creditosRestantes} es igual a 3 o 0, inserta justo antes de </body> este banner exacto:
   <div style="position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#fef2f2;border-top:2px solid #ef4444;color:#b91c1c;padding:12px 24px;font-family:sans-serif;font-size:14px;text-align:center;">
     ⚠️ Atención: Te quedan ${creditosRestantes} créditos de edición. Contacta a un asesor para llevar este diseño a producción o recargar tu cuenta.
   </div>

Formato de Salida (ESTRICTO):
Devuelve ÚNICAMENTE el nuevo código HTML válido. Cero explicaciones. Inicia con <!DOCTYPE html> y termina con </html>.
`;

export async function POST(req: NextRequest) {
    try {
        const { whatsapp, instruccion_texto, audio_base64 } = await req.json();

        if (!whatsapp) {
            return NextResponse.json({ error: 'WhatsApp requerido' }, { status: 400 });
        }

        // Normalizar número (solo dígitos)
        const numeroLimpio = whatsapp.replace(/\D/g, '');

        // 1. Obtener documento del usuario desde Firestore
        const db = getAdminDbSafe();
        if (!db) {
            return NextResponse.json({ error: 'Firebase no configurado en el servidor.' }, { status: 503 });
        }
        const docRef = db.collection('usuarios_leads').doc(numeroLimpio);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ error: 'Usuario no encontrado. Primero genera tu página.' }, { status: 404 });
        }

        const userData = docSnap.data()!;
        const creditosActuales: number = userData.creditos_restantes ?? 0;
        const codigoActual: string = userData.codigo_actual ?? '';

        // 2. Validar créditos
        if (creditosActuales < CREDITOS_POR_EDICION) {
            return NextResponse.json({
                error: 'creditos_insuficientes',
                creditos: creditosActuales,
                message: '¡Créditos insuficientes! Habla con nosotros para recargar tu cuenta.'
            }, { status: 402 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

        // 3. Transcribir audio si se envió
        let transcripcionAudio = '';
        if (audio_base64) {
            try {
                const audioModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const audioResult = await audioModel.generateContent([
                    {
                        inlineData: {
                            mimeType: 'audio/webm',
                            data: audio_base64,
                        },
                    },
                    'Transcribe este audio exactamente en español. Solo devuelve el texto transcrito, sin explicaciones.'
                ]);
                transcripcionAudio = audioResult.response.text().trim();
            } catch (audioErr) {
                console.warn('Error transcribiendo audio:', audioErr);
                transcripcionAudio = '';
            }
        }

        // 4. Llamar a Gemini con el Prompt Maestro
        const creditosPostEdicion = creditosActuales - CREDITOS_POR_EDICION;
        const editModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = buildEditPrompt(codigoActual, instruccion_texto || '', transcripcionAudio, creditosPostEdicion);

        const result = await editModel.generateContent(prompt);
        let nuevoHtml = result.response.text();

        // Limpiar markdown si Gemini lo agrega
        nuevoHtml = nuevoHtml.replace(/```html\n?/gi, '').replace(/```\n?/g, '').trim();

        // 5. Actualizar Firestore (descontar créditos + guardar nuevo código)
        const dbForUpdate = getAdminDbSafe();
        if (dbForUpdate) {
            await dbForUpdate.collection('usuarios_leads').doc(numeroLimpio).update({
                codigo_actual: nuevoHtml,
                creditos_restantes: creditosPostEdicion,
                ultima_edicion: new Date().toISOString(),
                instruccion_texto: instruccion_texto || '',
                transcripcion_audio: transcripcionAudio,
            });
        }

        return NextResponse.json({
            html: nuevoHtml,
            creditos_restantes: creditosPostEdicion,
            transcripcion_audio: transcripcionAudio,
        });

    } catch (error) {
        console.error('Error editando página:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
