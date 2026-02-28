import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Firebase Admin - solo importar si las variables están configuradas
const getAdminDb = async () => {
  if (!process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID === 'TU_PROYECTO_ID') {
    return null;
  }
  const { getAdminDbSafe } = await import('@/lib/firebase-admin');
  return getAdminDbSafe();
};

export const maxDuration = 60; // Permitir ejecución más larga en Vercel

// ─── PROMPT MAESTRO DEFINITIVO ───────────────────────────────────────────────
const buildPrompt = (input: string) => `
ROL Y MANDATO:
Actúe como un Maestro Arquitecto Web de Inteligencia Artificial de DIGITRIAL, con la capacidad de diseñar y codificar experiencias web dinámicas premium de alto impacto. Su mandato es procesar la descripción detallada de la idea de un usuario de DIGITRIAL y generar un sitio web completo, funcional y dinámico utilizando un stack de programación moderno y robusto (HTML5, Tailwind CSS, y JavaScript avanzado integrados en un solo archivo).

CONTEXTO DE ENTRADA DEL USUARIO:
"${input}"

INSTRUCCIONES DE GENERACIÓN DE SITIO WEB DINÁMICO PREMIUM:

1. ANÁLISIS E INFERENCIA:
Procese la descripción del usuario. Infiere la actividad económica, los productos/servicios clave y el público objetivo. Adapta creativamente el diseño para que sirva y se alinee perfectamente con la actividad económica y los detalles específicos del usuario de DIGITRIAL. NUNCA uses "Lorem Ipsum".

2. DISEÑO DINÁMICO Y MOVIMIENTO (CRÍTICO):
Intrínsecamente Dinámico: Genere un sitio web que sea intrínsecamente dinámico, no estático. Implementa movimientos y animaciones modernas en todo el sitio para dar vida a la página: efectos de paralaje, scroll-triggered animations (Vía GSAP desde CDN preferiblemente), y microinteracciones visuales fluidas.
Layout Profesional y Estético: Priorice layouts modernos, limpios y espaciados generosamente. ¡ATENCIÓN! NO generes páginas exclusivamente en color oscuro (Dark Mode) por defecto. Los colores, la paleta y el estilo visual general deben estar ESTRICTAMENTE CONDICIONADOS por las indicaciones del texto, el audio descriptivo o el estilo de las imágenes adjuntas. Elije creativamente la paleta que mejor represente la actividad del negocio, incorporando siempre secciones de "Social proof" al estilo del diseño premium.

3. IMÁGENES ÚNICAS Y STOCK DE VIDEOS (NANO BANANA 2 + LOREMFLICKR + STICK DE VIDS):
¡REGLA ABSOLUTAMENTE ESTRICTA! Está terminantemente prohibido usar color gradients genéricos o placeholders simples. 
Debes integrar imágenes fotográficas reales de alta calidad (via Nano Banana 2) O videos de stock ("Stick de vids") para fondos y hero sections.

**PARA IMÁGENES (SISTEMA PRIMARIO + RESPALDO):**
Tu **PRIMERA OPCIÓN SIEMPRE** debe ser Nano Banana 2 (Pollinations).
Usa esta estructura EXACTA para el atributo 'src' de la imagen:
https://image.pollinations.ai/prompt/[descripcion-detallada-en-ingles]?width=[ancho]&height=[alto]&nologo=true
¡CRÍTICO! REEMPLAZA LOS ESPACIOS EN BLANCO EN LA DESCRIPCIÓN EXCLUSIVAMENTE POR GUIONES MEDIOS ('-').

**SISTEMA DE RESPALDO OBLIGATORIO (FALLBACK):**
Como los servidores primarios pueden fallar, **ES OBLIGATORIO Y ESTRICTO** que TODAS las etiquetas <img> incluyan un atributo 'onerror' que cargue una imagen desde LoremFlickr si la primera falla.
El atributo 'onerror' debe tener esta estructura EXACTA:
onerror="this.onerror=null; this.src='https://loremflickr.com/1600/900/[palabra_clave_1],[palabra_clave_2]/all';"
¡CRÍTICO! EN LA URL DE RESPALDO, REEMPLAZA LOS ESPACIOS EN BLANCO EXCLUSIVAMENTE POR COMAS (',').

**Ejemplo Perfecto de etiqueta <img>:**
<img src="https://image.pollinations.ai/prompt/macro-photorealistic-high-end-photography-of-roasted-coffee-bean?width=1600&height=900&nologo=true" onerror="this.onerror=null; this.src='https://loremflickr.com/1600/900/coffee,shop/all';" alt="Granos de café" class="...">

PARA VIDEOS DE FONDOS (Stock de videos / Stick de vids):
Puedes usar libremente estos enlaces de videos MP4 de alta calidad libres de derechos como fondo de Hero sections o bloques divisorios (usa la etiqueta <video autoplay loop muted playsinline class="..."></video>):
- Oficina/Tecnología: https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-4174-large.mp4
- Negocios/Reunión: https://assets.mixkit.co/videos/preview/mixkit-people-in-a-business-meeting-working-on-a-project-4180-large.mp4
- Emprendedor/Café: https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-laptop-in-a-coffee-shop-4171-large.mp4
- Abstracto/Cyber: https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-connection-background-27202-large.mp4

Alternativa para imágenes genéricas/placeholders: https://picsum.photos/seed/[palabra_clave_aleatoria]/1920/1080

4. USO DE LENGUAJES DE PROGRAMACIÓN:
Simula un ecosistema completo mediante HTML5, Tailwind CSS via CDN, y Vanilla JS (y bibliotecas como GSAP/AOS via CDN). El output debe estar optimizado y renderizado en un solo archivo.

5. IMPLEMENTACIÓN DE LA EXPERIENCIA DE CARGA INMERSIVA (OBLIGATORIO):
Genere código que, al ejecutarse en el navegador, muestre PRIMERO una experiencia de carga inmersiva antes de renderizar el contenido principal.
- Un icono dinámico y animado de Digitrial (con efecto de pulso o brillo, ej: un triángulo).
- Un contador de porcentaje numérico que avance del 0% al 100% en tiempo real simulando el armado del sitio. Al llegar a 100%, desaparecerá revelando la landing de manera fluida (fade out).
- Lógica de programación funcional en <script> para gestionar este contador dinámicamente.

FORMATO DE SALIDA (ESTRICTO):
Debes retornar UN ÚNICO ARCHIVO HTML COMPLETO.
¡PELIGRO! ESTÁ ESTRICTAMENTE PROHIBIDO usar formato Markdown.
¡PELIGRO! JAMÁS envuelvas tu respuesta en bloques de código como \`\`\`html ni \`\`\`. Tu respuesta será insertada directamente en el navegador, si usas markdown romperás la página.
CERO explicaciones, preámbulos, ni saludos. Solo presenta el código fuente puro.
Tu respuesta debe comenzar EXACTAMENTE con <!DOCTYPE html> y terminar EXACTAMENTE con </html>.
Todos los scripts y estilos deben ir dentro.
`;

export async function POST(req: NextRequest) {
  try {
    const { descripcion, nombre_contacto, email, imagenes_base64 } = await req.json();

    if (!descripcion || descripcion.trim().length < 10) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const inputUsuario = descripcion;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'PEGA_TU_API_KEY_AQUI') {
      const fallbackHtml = buildFallbackHTML(descripcion.substring(0, 60) + '...', descripcion);
      return NextResponse.json({ html: fallbackHtml });
    }

    try {
      const customGoogle = createGoogleGenerativeAI({
        apiKey: apiKey,
      });

      const promptText = buildPrompt(inputUsuario);

      const userContent: any[] = [{ type: 'text', text: promptText }];

      if (Array.isArray(imagenes_base64) && imagenes_base64.length > 0) {
        imagenes_base64.forEach(imgBase64 => {
          const match = imgBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/i);
          const mimeType = match ? match[1] : 'image/jpeg';
          const base64Data = match ? match[2] : imgBase64.replace(/^data:image\/\w+;base64,/, '');

          userContent.push({
            type: 'image',
            image: Buffer.from(base64Data, 'base64'),
            mimeType: mimeType
          });
        });
      }

      const result = streamText({
        model: customGoogle('gemini-2.5-flash'),
        messages: [{ role: 'user', content: userContent }],
        onFinish: async ({ text }) => {
          // Limpiar markdown si el LLM no obedeció completamente
          const html = text.replace(/```html/gi, '').replace(/```/g, '').trim();

          if (email) {
            try {
              const adminDb = await getAdminDb();
              if (adminDb) {
                const emailKey = email.toLowerCase().trim().replace(/[.#$[\\]]/g, '_');
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
        },
      });

      return result.toTextStreamResponse();
    } catch (geminiError) {
      console.warn('Gemini API falló, usando fallback:', geminiError);
      return NextResponse.json({ html: buildFallbackHTML(descripcion.substring(0, 60), descripcion) });
    }
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
