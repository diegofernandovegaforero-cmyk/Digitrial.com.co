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

const buildEditPrompt = (codigoActual: string, instruccion: string) => `
AGENTE: GEMINI 3.1 PRO

ROL Y MANDATO:
Eres el Desarrollador Front-End Senior de Digitrial centro de soluciones.
Se te entrega el código HTML actual de una landing page y una instrucción del cliente para modificarla.

CÓDIGO HTML ACTUAL:
${codigoActual}

INSTRUCCIÓN DE CLIENTE: "${instruccion}"

REGLAS ESTRICTAS DE SALIDA:
- Devuelve SOLO el HTML completo modificado.
- PROHIBIDO usar Markdown. NO uses \`\`\`html ni \`\`\`.
- Tu respuesta debe comenzar EXACTAMENTE con <!DOCTYPE html> y terminar con </html>.
- Mantén la calidad premium y el diseño dinámico original.
- Si el usuario adjunta imágenes, úsalas según su instrucción.
`;

export async function POST(req: NextRequest) {
  try {
    const { email, instruccion_texto, id_diseno_base, imagenes_base64 } = await req.json();

    if (!email || !instruccion_texto) {
      return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 });
    }

    const adminDb = await getAdminDb();
    if (!adminDb) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const emailKey = email.toLowerCase().trim().replace(/[.#$[\]]/g, '_');
    const docRef = adminDb.collection('usuarios_leads').doc(emailKey);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userData = snap.data() || {};
    const creditosRestantes = userData.creditos_restantes ?? 0;

    if (creditosRestantes < 3) {
      return NextResponse.json({ error: 'Créditos insuficientes' }, { status: 402 });
    }

    // Obtener el código actual para editar
    let codigoParaEditar = userData.codigo_actual || '';
    
    // Si se especifica un ID de diseño base, intentar obtenerlo de la subcolección
    if (id_diseno_base) {
        const historySnap = await docRef.collection('historial_codigos').doc(id_diseno_base.toString()).get();
        if (historySnap.exists) {
            codigoParaEditar = historySnap.data()?.codigo_html || codigoParaEditar;
        }
    }

    if (!codigoParaEditar) {
        return NextResponse.json({ error: 'No se encontró código para editar' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const customGoogle = createGoogleGenerativeAI({ apiKey });

    const promptText = buildEditPrompt(codigoParaEditar, instruccion_texto);
    const userContent: any[] = [{ type: 'text', text: promptText }];

    // Manejo de imágenes adjuntas
    if (Array.isArray(imagenes_base64) && imagenes_base64.length > 0) {
      let placeholdersInstruccion = "\n\nNUEVAS IMÁGENES ADJUNTAS (Úsalas si el cliente lo pide):\n";
      imagenes_base64.forEach((imgBase64, idx) => {
        const match = imgBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/i);
        const mimeType = match ? match[1] : 'image/jpeg';
        const base64Data = match ? match[2] : imgBase64.replace(/^data:image\/\w+;base64,/, '');

        userContent.push({
          type: 'image',
          image: Buffer.from(base64Data, 'base64'),
          mimeType: mimeType
        });
        placeholdersInstruccion += `UPLOADED_IMG_${idx + 1}\n`;
      });
      userContent.push({ type: 'text', text: placeholdersInstruccion });
    }

    const modelosFallback = ['gemini-3.1-pro-preview', 'gemini-2.5-pro', 'gemini-pro-latest'];
    let lastError: any = null;

    for (const modelName of modelosFallback) {
      try {
        const result = await streamText({
          model: customGoogle(modelName),
          messages: [{ role: 'user', content: userContent }],
          onFinish: async ({ text }) => {
            let cleanHtml = text.replace(/```html/gi, '').replace(/```/g, '').trim();

            // Reemplazar placeholders de imágenes subidas
            if (Array.isArray(imagenes_base64) && imagenes_base64.length > 0) {
                imagenes_base64.forEach((b64, idx) => {
                    cleanHtml = cleanHtml.split(`UPLOADED_IMG_${idx + 1}`).join(b64);
                });
            }

            const historyId = Date.now().toString();
            const newDesignMetadata = {
              id: historyId,
              descripcion: `Edición: ${instruccion_texto.substring(0, 100)}`,
              fecha: new Date().toISOString(),
              has_separate_code: true
            };

            // 1. Guardar en subcolección
            await docRef.collection('historial_codigos').doc(historyId).set({
              codigo_html: cleanHtml,
              fecha: new Date().toISOString()
            });

            // 2. Actualizar doc principal
            const currentHistory = userData.historial_disenos || [];
            const updatedHistory = [newDesignMetadata, ...currentHistory].slice(0, 10);

            const updatePayload: any = {
              historial_disenos: updatedHistory,
              ultima_edicion: new Date().toISOString(),
              creditos_restantes: Math.max(0, creditosRestantes - 3)
            };

            if (Buffer.byteLength(cleanHtml, 'utf8') < 800000) {
              updatePayload.codigo_actual = cleanHtml;
            }

            await docRef.update(updatePayload);
          }
        });

        return result.toTextStreamResponse();
      } catch (err: any) {
        console.warn(`Fallo edición con ${modelName}:`, err.message);
        lastError = err;
      }
    }

    throw lastError || new Error('Todos los modelos fallaron en edición');

  } catch (error) {
    console.error('Error fatal en API de edición:', error);
    return NextResponse.json({ error: 'Error interno en el proceso de edición.' }, { status: 500 });
  }
}
