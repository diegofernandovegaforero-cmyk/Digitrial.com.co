import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Firebase Admin - solo importar si las variables están configuradas
const getAdminDb = async () => {
  if (!process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID === 'TU_PROYECTO_ID') {
    return null;
  }
  const { adminDb } = await import('@/lib/firebase-admin');
  return adminDb;
};

const buildPrompt = (nombre: string, sector: string, productos: string, estilo: string) => `
Rol: Actúa como un Diseñador Web Senior y Experto en Embudos de Ventas (CRO).

Instrucciones ESTRICTAS:
- Devuelve ÚNICAMENTE código HTML válido, empezando con <!DOCTYPE html> y terminando con </html>.
- Usa Tailwind CSS vía CDN: <script src="https://cdn.tailwindcss.com"></script>
- NO incluyas explicaciones, comentarios externos ni bloques de código markdown.
- Diseño responsivo (md:, lg:), colores modernos, texto real en español (sin Lorem Ipsum).
- Incluye estas secciones: Hero (H1 + subtítulo + CTA), Problema/Solución, Servicios en cards, Testimonios placeholder, Footer con CTA.

Datos del cliente:
- Nombre del Negocio: ${nombre}
- Sector / Actividad: ${sector}
- Productos / Servicios Estrella: ${productos}
- Estilo Visual / Tono: ${estilo}

Genera una landing page completa, persuasiva y orientada a ventas para este negocio.
`;

const buildFallbackHTML = (nombre: string, sector: string, productos: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${nombre}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="font-sans bg-white text-gray-800">
  <section class="bg-gradient-to-br from-blue-900 via-purple-800 to-pink-700 text-white py-24 px-6 text-center">
    <h1 class="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
      Bienvenido a <span class="text-yellow-300">${nombre}</span>
    </h1>
    <p class="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
      Ofrecemos ${productos} para llevar tu negocio al siguiente nivel.
    </p>
    <a href="https://wa.me/573123299053" class="bg-yellow-400 text-gray-900 font-bold px-8 py-4 rounded-full text-lg hover:bg-yellow-300 transition shadow-xl">
      Contáctanos ahora
    </a>
  </section>
  <section id="contacto" class="bg-blue-900 text-white py-16 px-6 text-center">
    <h2 class="text-2xl font-bold mb-4">Agenda tu asesoría gratis</h2>
    <a href="https://wa.me/573123299053" target="_blank" class="bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-full hover:bg-yellow-300 transition inline-block">
      📱 Hablar por WhatsApp
    </a>
  </section>
</body>
</html>
`;

export async function POST(req: NextRequest) {
  try {
    const { nombre, sector, productos, estilo, whatsapp } = await req.json();

    if (!nombre || !sector || !productos || !estilo) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let html: string;

    if (!apiKey || apiKey === 'PEGA_TU_API_KEY_AQUI') {
      html = buildFallbackHTML(nombre, sector, productos);
    } else {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(buildPrompt(nombre, sector, productos, estilo));
        html = result.response.text().replace(/```html\n?/gi, '').replace(/```\n?/g, '').trim();
      } catch (geminiError) {
        console.warn('Gemini API falló, usando fallback:', geminiError);
        html = buildFallbackHTML(nombre, sector, productos);
      }
    }

    // Guardar lead en Firestore si Firebase está configurado y hay WhatsApp
    if (whatsapp) {
      try {
        const adminDb = await getAdminDb();
        if (adminDb) {
          const numeroLimpio = whatsapp.replace(/\D/g, '');
          const docRef = adminDb.collection('usuarios_leads').doc(numeroLimpio);
          const existing = await docRef.get();
          if (!existing.exists) {
            await docRef.set({
              nombre, sector, productos, estilo,
              whatsapp: numeroLimpio,
              codigo_actual: html,
              creditos_restantes: 15,
              fecha_creacion: new Date().toISOString(),
            });
          } else {
            await docRef.update({ codigo_actual: html, ultima_generacion: new Date().toISOString() });
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
