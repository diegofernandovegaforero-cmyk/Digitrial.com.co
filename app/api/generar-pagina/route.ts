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
ROL Y OBJETIVO:
Eres el Maestro Arquitecto Web de IA de DIGITRIAL. Tu único propósito es transformar la descripción del cliente en un sitio web dinámico, premium, de alta conversión y completamente funcional. Este sitio debe impresionar a primera vista, ser intrínsecamente animado y estar listo para vender.

DESCRIPCIÓN DEL CLIENTE:
"${input}"

ANÁLISIS E INFERENCIA:
- Si el cliente menciona una URL de referencia en su descripción, analiza inteligentemente los patrones de diseño de ese sitio y adáptalos creativamente al negocio del cliente.
- Infiere las mejores prácticas del sector y crea textos persuasivos (copywriting CRO). NUNCA uses "Lorem Ipsum".

ESTRUCTURA OBLIGATORIA Y DISEÑO MULTIMEDIA (CRÍTICO):
¡ESTÁ ESTRICTAMENTE PROHIBIDO CREAR SECCIONES CON FONDOS DE COLOR SÓLIDO O DEGRADADOS SIMPLES COMO ÚNICO RECURSO VISUAL! TODA PÁGINA DEBE TENER FOTOGRAFÍAS REALES.

1. PANTALLA DE CARGA INMERSIVA (antes que todo el contenido): Fondo negro, logo/ícono de DIGITRIAL animado con CSS, contador numérico 0-100% (JS puro). Desaparece con transición suave al 100%.
2. HERO SECTION IMPRESIONANTE:
   - PROHIBIDO usar solo background-color o linear-gradient vacío.
   - OBLIGATORIO usar una IMAGEN de fondo de Unsplash (ej. background-image: url('https://source.unsplash.com/1600x900/?[sector]');) con un background-color: rgba(0,0,0,0.6) (overlay oscuro) usando CSS background-blend-mode.
   - OBLIGATORIO efecto Parallax (background-attachment: fixed).
   - Título H1 impactante, subtítulo, y CTA con hover animation.
3. PROPUESTA DE VALOR (GRID/FLEXBOX): Diseño de 2 columnas donde una columna tenga texto/iconos y la otra una imagen real gigante de Unsplash usando <img src="...">. Animación con AOS.
4. SERVICIOS/PRODUCTOS: Grilla de cards atractivas. CADA CARD DEBE TENER UNA IMAGEN en la parte superior (<img src="https://source.unsplash.com/400x300/?[producto]">). Efecto hover con sombra y escala.
5. TESTIMONIOS O ESTADÍSTICAS: Sección con fondo de imagen diferente o patrón visual complejo.
6. LLAMADO A LA ACCIÓN SECUNDARIO: Sección atractiva de contacto.
7. FOOTER: Logo, links, redes sociales y derechos reservados.

TECNOLOGÍA Y ESTILO PREMIUM OBLIGATORIO:
- HTML5 semántico.
- Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
- Google Fonts: Incluir fuente Outfit (o Inter): <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&display=swap" rel="stylesheet"> y aplicarla.
- AOS.js CDN para animaciones al scroll: <link rel="stylesheet" href="https://unpkg.com/aos@2.3.1/dist/aos.css"> y <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>. Inicializar con AOS.init({ duration: 800, once: true }) al final del body. Usar atributos data-aos.
- Imágenes: ES IMPERATIVO usar https://source.unsplash.com/1600x900/?[palabra-clave] para fondos y 800x600 para cards.
- Microinteracciones OBLIGATORIAS: botones con transform/box-shadow en hover, cards con scale(1.03) en hover.
- Glassmorphism: Usa backdrop-filter: blur() sobre fondos de imagen para paneles legibles.
- Diseño 100% responsivo: Flexbox o CSS Grid en md y lg.

PANTALLA DE CARGA INTERNA — ESPECIFICACIONES EXACTAS:
- Debe ser el primer elemento del <body>, con position:fixed, z-index:9999, fondo #09090b (negro casi puro), flex centrado.
- Contenido: Triángulo/ícono animado con @keyframes (efecto de glow pulsante en color azul/púrpura), texto "DIGITRIAL" debajo del ícono, contador de porcentaje grande (tipografía bold, color blanco) que va del 0% al 100%.
- JavaScript: usar setInterval para incrementar el contador de forma no-lineal. Al llegar al 100%, hacer fade-out con transition opacity y después display:none.

REGLAS DE SALIDA (CRÍTICO Y ABSOLUTAMENTE ESTRICTO):
ESTÁ ESTRICTAMENTE PROHIBIDO usar formato Markdown. JAMÁS envuelvas tu respuesta en \`\`\`html ni \`\`\`. CERO explicaciones, CERO saludos.
Tu respuesta debe comenzar EXACTAMENTE con <!DOCTYPE html> y terminar EXACTAMENTE con </html>.
Todo el CSS personalizado va en una etiqueta <style> dentro del <head>.
Todo el JavaScript va en etiquetas <script> antes de </body>.
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
