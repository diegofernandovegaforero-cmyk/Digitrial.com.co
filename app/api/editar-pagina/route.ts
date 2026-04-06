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
AGENTE: GEMINI 3.5 FLASH
ROL Y MANDATO:
Eres el Desarrollador Front-End Senior de Digitrial.
Se te entrega el código HTML actual de una landing page comercial y una instrucción para modificarla.

¡REGLA DE ORO DE SEGURIDAD!:
Tu respuesta debe contener ÚNICAMENTE el código de la landing page (Sección Hero, Servicios, Contacto, etc.). 
Está TERMINANTEMENTE PROHIBIDO incluir cualquier tipo de interfaz de administración, paneles de edición, barras laterales de herramientas, menús de configuración o botones de "Guardar/Actualizar". 
Si el código actual contiene este tipo de elementos ajenos a la web del cliente, ELIMÍNALOS inmediatamente.

CÓDIGO HTML ACTUAL:
${codigoActual}

INSTRUCCIÓN DE CLIENTE: "${instruccion}"

REGLAS ESTRICTAS DE SALIDA:
- Devuelve SOLO el HTML completo y funcional.
- PROHIBIDO usar bloques de Markdown (\`\`\`html).
- Tu respuesta debe comenzar con <!DOCTYPE html> y terminar con </html>.
- Mantén la calidad premium y el diseño dinámico.
- NO uses "background-clip: text" en los títulos.
- El fondo del Hero debe ser preferiblemente un tono suave como #ebedef si no se indica otro.
- **LOGOS E ICONOS:** Se permite y recomienda el uso de **código SVG directo** para crear o mejorar logos e iconos si el cliente lo solicita o si faltan en el diseño.
`;

export async function POST(req: NextRequest) {
  try {
    const { email, instruccion_texto, id_diseno_base, imagenes_base64, rid } = await req.json();

    if (!email || !instruccion_texto) {
      return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 });
    }

    const adminDb = await getAdminDb();
    if (!adminDb) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const emailKey = email.toLowerCase().trim().replace(/[.#$[\]]/g, '_');
    const docRef = adminDb.collection('maquetasweb_usuarios').doc(emailKey);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userData = snap.data() || {};
    const creditosRestantes = userData.creditos_restantes ?? 5;

    if (creditosRestantes < 1) {
      return NextResponse.json({ error: 'Créditos insuficientes (1 crédito por edición).' }, { status: 402 });
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
      let placeholdersInstruccion = `\n\nNUEVAS IMÁGENES ADJUNTAS (Úsalas si el cliente lo pide):
¡IMPORTANTE SOBRE IMÁGENES!: 
1. Si el usuario adjunta capturas de pantalla, IGNORA Y NO RECREES ninguna interfaz de usuario, menús o barras corporativas del editor. Las imágenes son solo para referencia del diseño (fotos, colores, secciones) de la Landing Page.
2. ¡ATENCIÓN AL LOGO!: Si el usuario indica que una imagen es un logo, colócalo en el Header/Nav.\n`;
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

            const currentHistory = userData.historial_disenos || [];
            const updatedHistory = [newDesignMetadata, ...currentHistory].slice(0, 10);

            // OPTIMIZACIÓN: Refrescar snap para evitar colisiones de RID y usar FieldValue
            const { getAdminFieldValue } = await import('@/lib/firebase-admin');
            const FieldValue = getAdminFieldValue();
            const freshSnap = await docRef.get();
            const freshData = freshSnap.data() || {};

            if (rid && freshData.last_rid === rid) {
                console.log(`IDEMPOTENCIA: Petición ${rid} ya procesada. Saltando cargos.`);
                return;
            }

            const updatePayload: any = {
              historial_disenos: updatedHistory,
              ultima_edicion: new Date().toISOString(),
              creditos_restantes: FieldValue.increment(-1),
              last_rid: rid || null
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
