import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Firebase Admin - solo importar si las variables están configuradas
const getAdminDb = async () => {
  if (!process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID === 'TU_PROYECTO_ID') {
    return null;
  }
  const { getAdminDbSafe } = await import('@/lib/firebase-admin');
  return getAdminDbSafe();
};

// ─── PROMPT MAESTRO DEFINITIVO ───────────────────────────────────────────────
const buildPrompt = (input: string) => `
Rol:
Eres el Desarrollador Front-End Senior y Experto en Embudos de Venta (CRO) de Digitrial centro de soluciones. Tu objetivo es transformar la idea del cliente en una Landing Page de alta conversión, moderna y lista para vender.

Contexto de Entrada:
Instrucción del cliente: ${input}

Instrucciones de Construcción:

Análisis e Inferencia: Si el cliente da poca información, infiere las mejores prácticas de su sector. Inventa textos persuasivos (Copywriting) orientados a los beneficios. NUNCA uses "Lorem Ipsum".

Estructura de Alta Conversión:
- Hero Section: Título impactante (H1), subtítulo que resuelva un problema y un Botón de Llamado a la Acción (CTA) llamativo.
- Propuesta de Valor: 3 razones de peso para elegirlos (con iconos).
- Servicios/Productos: Grilla de tarjetas (cards) atractivas.
- Footer: Información de contacto, enlaces y derechos reservados.

Tecnología y Estilo:
- Utiliza HTML5 semántico.
- Usa el CDN oficial de Tailwind CSS (<script src="https://cdn.tailwindcss.com"></script>) en el <head>.
- Aplica un diseño muy moderno, sombras suaves (shadow-lg), bordes redondeados (rounded-2xl) y colores coherentes con el sector.
- Diseño 100% responsivo (md:, lg:).
- Usa source.unsplash.com con palabras clave del sector para las imágenes.

Reglas de Salida (CRÍTICO Y ESTRICTO):
ESTÁ ESTRICTAMENTE PROHIBIDO usar formato Markdown. NO envuelvas tu respuesta en \`\`\`html ni \`\`\`. Cero explicaciones, cero saludos. Tu respuesta debe comenzar EXACTAMENTE con <!DOCTYPE html> y terminar EXACTAMENTE con </html>.
`;

export async function POST(req: NextRequest) {
  try {
    const { descripcion, nombre_contacto, email } = await req.json();

    if (!descripcion || descripcion.trim().length < 10) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Usar la descripción directamente como input
    const inputUsuario = descripcion;

    const apiKey = process.env.GEMINI_API_KEY;
    let html: string;

    if (!apiKey || apiKey === 'PEGA_TU_API_KEY_AQUI') {
      html = buildFallbackHTML(descripcion.substring(0, 60) + '...', descripcion);
    } else {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(buildPrompt(inputUsuario));
        html = result.response.text()
          .replace(/```html\n?/gi, '')
          .replace(/```\n?/g, '')
          .trim();
      } catch (geminiError) {
        console.warn('Gemini API falló, usando fallback:', geminiError);
        html = buildFallbackHTML(descripcion.substring(0, 60), descripcion);
      }
    }

    // Guardar lead en Firestore si Firebase y email están disponibles
    if (email) {
      try {
        const adminDb = await getAdminDb();
        if (adminDb) {
          const emailKey = email.toLowerCase().trim().replace(/[.#$[\]]/g, '_');
          const docRef = adminDb.collection('usuarios_leads').doc(emailKey);
          const existing = await docRef.get();
          if (!existing.exists) {
            await docRef.set({
              nombre_negocio: descripcion.substring(0, 60),
              nombre_contacto: nombre_contacto || '',
              email: email.toLowerCase().trim(),
              descripcion,
              codigo_actual: html,
              creditos_restantes: 15,
              fecha_creacion: new Date().toISOString(),
            });
          } else {
            await docRef.update({
              codigo_actual: html,
              ultima_generacion: new Date().toISOString(),
            });
          }
        }
      } catch (fbErr) {
        console.warn('Firebase no disponible:', fbErr);
      }
    }

    return NextResponse.json({ html });
  } catch (error) {
    console.error('Error generando página:', error);
    return NextResponse.json({ error: 'Error generando la página' }, { status: 500 });
  }
}

// ─── FALLBACK HTML ────────────────────────────────────────────────────────────
function buildFallbackHTML(titulo: string, descripcion: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titulo}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="font-sans bg-white text-gray-800">
  <section class="bg-gradient-to-br from-blue-900 via-purple-800 to-pink-700 text-white py-24 px-6 text-center">
    <h1 class="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">${titulo}</h1>
    <p class="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">${descripcion}</p>
    <a href="#contacto" class="bg-yellow-400 text-gray-900 font-bold px-8 py-4 rounded-full text-lg hover:bg-yellow-300 transition shadow-xl">
      ¡Quiero empezar ahora!
    </a>
  </section>
  <section id="contacto" class="bg-blue-900 text-white py-16 px-6 text-center">
    <h2 class="text-2xl font-bold mb-4">Agenda tu asesoría gratis</h2>
    <a href="https://wa.me/573123299053" target="_blank" class="bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-full hover:bg-yellow-300 transition inline-block">
      📱 Hablar por WhatsApp
    </a>
  </section>
</body>
</html>`;
}
