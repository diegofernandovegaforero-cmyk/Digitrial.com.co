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
- Si el cliente menciona una URL de referencia en su descripción, analiza inteligentemente los patrones de diseño de ese sitio (colores, tipografía, estructura, tono) y adáptalos creativamente al negocio del cliente. NUNCA copies ni clones el sitio de referencia.
- Si el cliente da poca información, infiere las mejores prácticas del sector. Crea textos persuasivos (copywriting CRO) orientados a beneficios reales. NUNCA uses "Lorem Ipsum".

ESTRUCTURA OBLIGATORIA DE ALTA CONVERSIÓN:
1. PANTALLA DE CARGA INMERSIVA (antes que todo el contenido): Fondo negro, logo/ícono de DIGITRIAL animado con CSS (efecto de pulso y brillo), contador numérico de porcentaje del 0% al 100% que avanza automáticamente con checkpoints realistas usando JavaScript puro. La pantalla desaparece con una transición suave al llegar al 100%.
2. HERO SECTION: Título H1 impactante, subtítulo que resuelve un problema, imagen de fondo de alta calidad con efecto parallax sutil, CTA principal llamativo con hover animation.
3. PROPUESTA DE VALOR: 3 tarjetas con icono, título y descripción. Animación al scroll con AOS.
4. SERVICIOS/PRODUCTOS: Grilla de cards atractivas con imágenes Unsplash relevantes, efecto hover con sombra y escala. Animación al scroll con AOS.
5. TESTIMONIOS O ESTADÍSTICAS: 2-3 elementos que generen confianza. Animación al scroll con AOS.
6. LLAMADO A LA ACCIÓN SECUNDARIO: Sección de contacto o CTA final con formulario simple o botón de WhatsApp.
7. FOOTER: Logo, links, redes sociales y derechos reservados.

TECNOLOGÍA Y ESTILO PREMIUM OBLIGATORIO:
- HTML5 semántico con estructura clara.
- Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
- Google Fonts: Incluir en el <head> la fuente Outfit (o Inter para sectores corporativos): <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&display=swap" rel="stylesheet"> y aplicarla al body.
- AOS.js CDN para animaciones al scroll: <link rel="stylesheet" href="https://unpkg.com/aos@2.3.1/dist/aos.css"> y <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>. Inicializar con AOS.init({ duration: 800, once: true }) al final del body. Usar atributos data-aos="fade-up", data-aos="fade-left", data-aos="zoom-in" en las secciones.
- Imágenes: Usar https://source.unsplash.com/1200x600/?[palabra-clave-del-sector] para imágenes de alta calidad. Seleccionar palabras clave específicas del negocio del cliente.
- Paleta de colores: NO usar colores genéricos. Diseñar una paleta curada y armoniosa (usando CSS custom properties --color-primary, --color-secondary, etc.) coherente con el sector y el tono del negocio.
- Microinteracciones OBLIGATORIAS en CSS: botones con transform y box-shadow en hover, cards con scale(1.03) en hover, links con animación de subrayado.
- Efecto Parallax en el Hero: usar CSS background-attachment: fixed o JavaScript sencillo para el efecto parallax en la imagen del hero.
- Sombras, bordes redondeados y glassmorphism donde corresponda (backdrop-filter: blur).
- Diseño 100% responsivo: Mobile first, breakpoints md y lg.
- Gradientes modernos y transiciones suaves en toda la página.

PANTALLA DE CARGA INTERNA — ESPECIFICACIONES EXACTAS:
- Debe ser el primer elemento del <body>, con position:fixed, z-index:9999, fondo #09090b (negro casi puro), flex centrado.
- Contenido: Triángulo/ícono animado con @keyframes (efecto de glow pulsante en color azul/púrpura), texto "DIGITRIAL" debajo del ícono, contador de porcentaje grande (tipografía bold, color blanco) que va del 0% al 100%.
- JavaScript: usar setInterval para incrementar el contador de forma no-lineal (rápido al inicio, más lento en el medio, rápido al final). Al llegar al 100%, hacer fade-out con transition opacity y después display:none para revelar el contenido.
- El contenido principal debe empezar con opacity:0 y transicionar a opacity:1 cuando la carga termine.

REGLAS DE SALIDA (CRÍTICO Y ABSOLUTAMENTE ESTRICTO):
ESTÁ ESTRICTAMENTE PROHIBIDO usar formato Markdown. JAMÁS envuelvas tu respuesta en \`\`\`html ni \`\`\`. CERO explicaciones, CERO saludos, CERO comentarios fuera del HTML.
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
