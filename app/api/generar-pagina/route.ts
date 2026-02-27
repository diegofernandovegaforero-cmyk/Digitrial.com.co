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
ROL Y MANDATO:
Actúe como un Maestro Arquitecto Web de Inteligencia Artificial de DIGITRIAL, con la capacidad de diseñar y codificar experiencias web dinámicas premium de alto impacto. Su mandato es procesar la descripción detallada de la idea de un usuario de DIGITRIAL y generar un sitio web completo, funcional y dinámico utilizando un stack de programación moderno y robusto (HTML5, Tailwind CSS, y JavaScript avanzado integrados en un solo archivo).

CONTEXTO DE ENTRADA DEL USUARIO:
"${input}"

INSTRUCCIONES DE GENERACIÓN DE SITIO WEB DINÁMICO PREMIUM:

1. ANÁLISIS E INFERENCIA:
Procese la descripción del usuario. Infiere la actividad económica, los productos/servicios clave y el público objetivo. Si se proporciona una URL de referencia en la descripción, analícela profundamente (patrones de diseño, paleta, estructura).
NO Clonar: Está estrictamente prohibido crear una copia idéntica del sitio de referencia.
Recontextualización: Extraer inteligentemente los patrones y conceptos de diseño y adaptarlos de manera creativa para que sirvan y se alineen perfectamente con la actividad económica y los detalles específicos del usuario de DIGITRIAL. El diseño resultante debe ser inspirado por la referencia pero enfocado en el usuario de DIGITRIAL. NUNCA uses "Lorem Ipsum".

2. DISEÑO DINÁMICO Y MOVIMIENTO (CRÍTICO):
Intrínsecamente Dinámico: Genere un sitio web que sea intrínsecamente dinámico, no estático. Esto significa implementar movimientos y animaciones modernas en todo el sitio para dar vida a la página (efectos de paralaje, scroll-triggered animations vía AOS.js o GSAP desde CDN, microinteracciones visuales fluidas). El objetivo es una experiencia fluida y viva.
Layout Profesional y Estético: Priorice layouts modernos, limpios y espaciados generosamente. Se prefiere encarecidamente "Premium Dark Mode" con brillos "glow", incorporando secciones de "Social proof" y direct copy. ¡No crear fondos de color sólido simples como recurso principal!

3. IMÁGENES Y CONTENIDO (100% GRATIS POR IA):
Integración de Imágenes: Es OBLIGATORIO usar imágenes generadas por IA en tiempo real sin costo usando la API de Pollinations. ¡NO uses source.unsplash.com porque está deprecado!
Para cada imagen, construye una URL así: https://image.pollinations.ai/prompt/[descripcion_detallada_en_ingles]?width=[ancho]&height=[alto]&nologo=true
Ejemplo para fondo de Hero: https://image.pollinations.ai/prompt/professional%20modern%20startup%20office%20with%20people%20working?width=1600&height=900&nologo=true
Ejemplo para card de producto: https://image.pollinations.ai/prompt/delicious%20gourmet%20burger%20restaurant?width=600&height=400&nologo=true
TODA sección principal, testimonios y sub-elemento (como cards de servicio) debe contener estas imágenes dinámicas. Describe la solicitud de imagen de forma muy detallada y en INGLÉS en la URL (separando las palabras con %20). Usa backdrop-filter: blur() (glassmorphism) para legibilidad de textos sobre ellas.

4. USO DE LENGUAJES DE PROGRAMACIÓN:
Stack Moderno en un archivo: Dado el requerimiento técnico, debe simular un ecosistema completo (frontend interconectado) mediante HTML5, CSS avanzado, Tailwind via CDN y Vanilla JS / AOS.js via CDN <script>. El output debe estar optimizado y renderizado sin dependencias externas complejas.

5. IMPLEMENTACIÓN DE LA EXPERIENCIA DE CARGA INMERSIVA (CARGA DINÁMICA ABSOLUTAMENTE QUERIDA):
Prioridad de Carga: Genere código que, al ejecutarse en el navegador, muestre PRIMERO una experiencia de carga inmersiva antes de renderizar el contenido principal.
Icono Dinámico de DIGITRIAL: Incorporar el icono/nombre que debe ser animado con CSS puro (pulso, brillo).
Contador de Porcentaje Dinámico: Implementar un contador porcentual numérico que avance del 0% al 100% progresivamente con JavaScript, simulando tiempos de renderizado y armado. Al alcanzar 100%, desaparecerá revelando la landing de manera fluida (fade out).

FORMATO DE SALIDA (ESTRICTO):
Debes retornar UN ÚNICO ARCHIVO HTML COMPLETO.
ESTÁ ESTRICTAMENTE PROHIBIDO usar formato Markdown. JAMÁS envuelvas tu respuesta en \`\`\`html ni \`\`\`. CERO explicaciones, preámbulos, ni saludos. Solo presenta el código.
Tu respuesta debe comenzar EXACTAMENTE con <!DOCTYPE html> y terminar EXACTAMENTE con </html>.
Todo el CSS va en <style> y todo JS va en etiquetas <script> antes de cerrar el <body>.
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
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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
