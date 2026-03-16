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
31. Layout Profesional y Estético (SISTEMA DE DISEÑO PREMIUM): Diseñe con un Sistema de Diseño Coherente. Use tipografías modernas (Google Fonts via CDN) y una paleta de colores sofisticada.
   - **COLORES:** No se limite a fondos blancos o negros simples. Use degradados sutiles (mesh gradients), card backgrounds con desenfoque (glassmorphism), y acentos vibrantes que contrasten. El estilo visual debe ser "High-Tech Corporate" o "Creative Portfolio" según la descripción.
   - **ESTILO:** Priorice layouts modernos, limpios y espaciados generosamente. Incorpore siempre secciones de "Social proof" (logos de clientes, testimonios) al estilo del diseño premium.

3. IMÁGENES PROFESIONALES (PEXELS - PROVEEDOR ÚNICO):
¡REGLA ABSOLUTAMENTE ESTRICTA! Está terminantemente prohibido usar color gradients genéricos, placeholders o imágenes generadas por IA. 
Debes integrar EXCLUSIVAMENTE imágenes fotográficas reales de alta calidad usando nuestro proxy interno de Pexels O videos de stock ("Stick de vids") para fondos y hero sections.

**REGLA DE PROVEEDOR ÚNICO:**
Tu **ÚNICO PROVEEDOR** de imágenes debe ser Pexels usando nuestro endpoint local. NO uses Unsplash, Pollinations, Nano Banana, ni LoremFlickr.
Usa esta estructura EXACTA para el atributo 'src' de la imagen:
/api/pexels?q=[palabras+clave+en+ingles+separadas+por+signo+mas]

**Ejemplo Perfecto de etiqueta <img>:**
<img src="/api/pexels?q=luxury+modern+office+minimalist" alt="Oficina Premium" class="w-full h-64 object-cover rounded-2xl shadow-2xl">
**CONSEJO:** Para mejores resultados, usa términos como "minimalist", "professional", "vibrant", "aesthetic" junto a tu búsqueda.

PARA VIDEOS DE FONDOS (Stock de videos / Stick de vids):
Puedes usar libremente estos enlaces de videos MP4 de alta calidad libres de derechos como fondo de Hero sections o bloques divisorios (usa la etiqueta <video autoplay loop muted playsinline class="..."></video>):
- Oficina/Tecnología: https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-4174-large.mp4
- Negocios/Reunión: https://assets.mixkit.co/videos/preview/mixkit-people-in-a-business-meeting-working-on-a-project-4180-large.mp4
- Emprendedor/Café: https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-laptop-in-a-coffee-shop-4171-large.mp4
- Abstracto/Cyber: https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-connection-background-27202-large.mp4

4. USO DE LENGUAJES DE PROGRAMACIÓN:
Simula un ecosistema completo mediante HTML5, Tailwind CSS via CDN, y Vanilla JS (y bibliotecas como GSAP/AOS via CDN). El output debe estar optimizado y renderizado en un solo archivo.

5. PROHIBIDO USAR PANTALLAS DE CARGA (LOADING SCREENS ESPERA):
¡CRÍTICO! Está ESTRICTAMENTE PROHIBIDO generar cualquier tipo de pantalla de carga, preloader, spinner o "loading screen" (como contadores de 0% a 100%) dentro del código HTML.
El contenido principal de la página web DEBE SER VISIBLE INMEDIATAMENTE. No ocultes el '<body>' ni el '#main-content' con opacidad 0 o 'display: none'. La aplicación principal ya cuenta con su propia pantalla de carga, por lo que generar una segunda pantalla dentro del HTML rompe la experiencia de usuario.

6. FOOTER Y DERECHOS RESERVADOS:
¡ATENCIÓN! Al final de la página, DEBES incluir obligatoriamente una sección de Footer (Pie de página) que luzca limpio y profesional. En la parte inferior del Footer, DEBES escribir exactamente el símbolo de Copyright seguido del año actual y la frase de derechos reservados de esta forma: "© ${new Date().getFullYear()} Todos los derechos reservados", acompañado del nombre de la marca o empresa generada.

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
      return NextResponse.json({ error: 'Faltan campos requeridos o descripción muy corta' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const inputUsuario = descripcion;

    // PRE-CHECK LIMITS (if email is provided)
    if (email) {
      try {
        const adminDb = await getAdminDb();
        if (adminDb) {
          const emailKey = email.toLowerCase().trim().replace(/[.#$[\]]/g, '_');
          const docRef = adminDb.collection('usuarios_leads').doc(emailKey);
          const existing = await docRef.get();
          
          if (existing.exists) {
            const data = existing.data() || {};
            const historialLength = (data.historial_disenos || []).length;
            const creditosRestantes = data.creditos_restantes ?? 0;

            if (historialLength >= 3) {
              return NextResponse.json({ error: 'Has alcanzado el límite máximo de 3 maquetas.' }, { status: 403 });
            }
            if (creditosRestantes < 5) {
              return NextResponse.json({ error: 'No tienes los 5 créditos necesarios para generar una nueva página.' }, { status: 403 });
            }
          }
        }
      } catch (checkErr) {
        console.warn('Error en validación previa de Firebase:', checkErr);
      }
    }

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

      let placeholdersInstruccion = "";
      if (Array.isArray(imagenes_base64) && imagenes_base64.length > 0) {
        imagenes_base64.forEach((imgBase64, idx) => {
          const match = imgBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/i);
          const mimeType = match ? match[1] : 'image/jpeg';
          const base64Data = match ? match[2] : imgBase64.replace(/^data:image\/\w+;base64,/, '');

          userContent.push({
            type: 'image',
            image: Buffer.from(base64Data, 'base64'),
            mimeType: mimeType
          });
          placeholdersInstruccion += `- [UPLOADED_IMG_${idx + 1}]\n`;
        });
        
        userContent.push({
            type: 'text',
            text: `\n\n¡ALERTA CRÍTICA PARA IMÁGENES Y LOGOS!: El usuario ha adjuntado imágenes reales (que estás viendo). 
1. DEBES usarlas en tu código HTML insertando EXACTAMENTE estos identificadores literales en el 'src' de la etiqueta <img>:\n${placeholdersInstruccion}\nEjemplo: <img src="UPLOADED_IMG_1" class="...">. (Para OTRAS imágenes extras usa SIEMPRE /api/pexels).
2. ¡ATENCIÓN AL LOGO Y COLORES!: Si el usuario te indica que alguna de estas imágenes anexas ES UN LOGO, DEBES colocarla obligatoriamente en la barra de navegación (Header/Nav) como logo destacado. ADEMÁS, DEBES analizar visualmente esa imagen y extraer sus COLORES PREDOMINANTES para construir rigurosamente toda la Paleta de Colores (botones, fondos, textos, acentos) del sitio web con ellos.`
        });
      }

      const result = streamText({
        model: customGoogle('gemini-3.1-pro-preview'),
        messages: [{ role: 'user', content: userContent }],
        onFinish: async ({ text }) => {
          // Limpiar markdown si el LLM no obedeció completamente
          let html = text.replace(/```html/gi, '').replace(/```/g, '').trim();

          // Reemplazar placeholders en el HTML final para guardarlo en Firebase
          if (Array.isArray(imagenes_base64) && imagenes_base64.length > 0) {
            imagenes_base64.forEach((b64, idx) => {
              html = html.split(`UPLOADED_IMG_${idx + 1}`).join(b64);
            });
          }

          if (email) {
            try {
              const adminDb = await getAdminDb();
              if (adminDb) {
                const emailKey = email.toLowerCase().trim().replace(/[.#$[\\]]/g, '_');
                const docRef = adminDb.collection('usuarios_leads').doc(emailKey);
                const existing = await docRef.get();

                const newDesign = {
                  id: Date.now().toString(),
                  codigo_actual: html,
                  descripcion: descripcion.substring(0, 200), // Guardar un extracto de la desc original
                  fecha: new Date().toISOString(),
                };

                if (!existing.exists) {
                  await docRef.set({
                    nombre_negocio: descripcion.substring(0, 60),
                    nombre_contacto: nombre_contacto || '',
                    email: email.toLowerCase().trim(),
                    descripcion,
                    codigo_actual: html,
                    historial_disenos: [newDesign],
                    creditos_restantes: 15,
                    fecha_creacion: new Date().toISOString(),
                  });
                } else {
                  const data = existing.data() || {};
                  let historial = data.historial_disenos || [];

                  // Migración silenciosa: si no había historial, registrar el diseño vigente primero
                  if (historial.length === 0 && data.codigo_actual) {
                    historial.push({
                      id: (Date.now() - 1000).toString(),
                      codigo_actual: data.codigo_actual,
                      descripcion: data.descripcion ? data.descripcion.substring(0, 200) : 'Diseño anterior',
                      fecha: data.ultima_generacion || data.fecha_creacion || new Date().toISOString()
                    });
                  }

                  historial.unshift(newDesign);
                  historial = historial.slice(0, 3); // Mantener un máximo de 3 diseños recientes (REGLA ESTRICTA)

                  await docRef.update({
                    codigo_actual: html,
                    historial_disenos: historial,
                    ultima_generacion: new Date().toISOString(),
                    creditos_restantes: Math.max(0, (data.creditos_restantes ?? 15) - 5) // RESTAR 5 CRÉDITOS
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
