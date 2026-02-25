import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

// Plantilla de fallback si no hay API key
const buildFallbackHTML = (nombre: string, sector: string, productos: string, estilo: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${nombre}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="font-sans bg-white text-gray-800">
  <!-- Hero -->
  <section class="bg-gradient-to-br from-blue-900 via-purple-800 to-pink-700 text-white py-24 px-6 text-center">
    <h1 class="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
      Tu negocio en <span class="text-yellow-300">${sector}</span><br/>merece crecer en digital
    </h1>
    <p class="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
      En <strong>${nombre}</strong> ofrecemos ${productos} para llevar tu negocio al siguiente nivel. Sin complicaciones, con resultados reales.
    </p>
    <a href="#contacto" class="bg-yellow-400 text-gray-900 font-bold px-8 py-4 rounded-full text-lg hover:bg-yellow-300 transition shadow-xl">
      ¡Quiero empezar ahora!
    </a>
  </section>

  <!-- Problema / Solución -->
  <section class="py-20 px-6 max-w-5xl mx-auto">
    <h2 class="text-3xl font-bold text-center mb-4 text-gray-900">¿Estás perdiendo clientes por no tener presencia digital?</h2>
    <p class="text-center text-gray-500 text-lg mb-12">El 70% de los consumidores busca en Google antes de comprar. Si no apareces, tu competencia se lleva esos clientes.</p>
    <div class="grid md:grid-cols-2 gap-8 items-center">
      <div class="bg-red-50 rounded-2xl p-8 border border-red-200">
        <h3 class="text-xl font-bold text-red-600 mb-3">Sin ${nombre}</h3>
        <ul class="space-y-2 text-gray-600">
          <li>❌ Clientes que no te encuentran</li>
          <li>❌ Ventas estancadas sin estrategia</li>
          <li>❌ Dependencia del voz a voz únicamente</li>
        </ul>
      </div>
      <div class="bg-green-50 rounded-2xl p-8 border border-green-200">
        <h3 class="text-xl font-bold text-green-600 mb-3">Con ${nombre}</h3>
        <ul class="space-y-2 text-gray-600">
          <li>✅ Visible 24/7 en internet</li>
          <li>✅ Clientes llegando solos a ti</li>
          <li>✅ Crecimiento medible y constante</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Servicios / Cards -->
  <section class="bg-gray-50 py-20 px-6">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-12 text-gray-900">Nuestros Servicios Estrella</h2>
      <div class="grid md:grid-cols-3 gap-6">
        ${productos.split(',').map((p, i) => `
        <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition border border-gray-100">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-2xl">
            ${['🚀', '💡', '⭐'][i % 3]}
          </div>
          <h3 class="font-bold text-lg mb-2 text-gray-900">${p.trim()}</h3>
          <p class="text-gray-500 text-sm">Solución especializada en ${sector} para maximizar tus resultados y diferenciarte de la competencia.</p>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <!-- Testimonios -->
  <section class="py-20 px-6 max-w-5xl mx-auto">
    <h2 class="text-3xl font-bold text-center mb-12 text-gray-900">Lo que dicen nuestros clientes</h2>
    <div class="grid md:grid-cols-3 gap-6">
      ${[
    { nombre: 'Carlos M.', texto: `Desde que confié en ${nombre} mis ventas aumentaron un 40% en solo 2 meses.` },
    { nombre: 'Laura P.', texto: 'El equipo es increíblemente profesional. Resultados reales desde el primer mes.' },
    { nombre: 'Andrés R.', texto: 'Lo mejor que hice fue apostar por la transformación digital con ellos.' }
  ].map(t => `
      <div class="bg-white rounded-2xl p-6 shadow border border-gray-100">
        <p class="text-gray-600 italic mb-4">"${t.texto}"</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">${t.nombre[0]}</div>
          <span class="font-semibold text-gray-800">${t.nombre}</span>
        </div>
      </div>`).join('')}
    </div>
  </section>

  <!-- CTA Final / Footer -->
  <section id="contacto" class="bg-gradient-to-r from-blue-900 to-purple-800 text-white py-20 px-6 text-center">
    <h2 class="text-3xl md:text-4xl font-extrabold mb-4">¿Listo para transformar <span class="text-yellow-300">${nombre}</span>?</h2>
    <p class="text-blue-200 text-lg mb-8">Agenda una asesoría gratuita hoy mismo y descubre cómo podemos multiplicar tus resultados.</p>
    <a href="https://wa.me/573123299053" target="_blank" class="bg-yellow-400 text-gray-900 font-bold px-10 py-4 rounded-full text-xl hover:bg-yellow-300 transition shadow-xl inline-block">
      📱 Agendar Asesoría Gratis
    </a>
    <p class="mt-8 text-blue-300 text-sm">© 2025 ${nombre} · Todos los derechos reservados</p>
  </section>
</body>
</html>
`;

export async function POST(req: NextRequest) {
  try {
    const { nombre, sector, productos, estilo } = await req.json();

    if (!nombre || !sector || !productos || !estilo) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Si no hay API key válida, usar plantilla de fallback
    if (!apiKey || apiKey === 'PEGA_TU_API_KEY_AQUI') {
      const html = buildFallbackHTML(nombre, sector, productos, estilo);
      return NextResponse.json({ html });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = buildPrompt(nombre, sector, productos, estilo);

      const result = await model.generateContent(prompt);
      let html = result.response.text();

      // Limpiar bloques de código markdown si Gemini los agrega
      html = html.replace(/```html\n?/gi, '').replace(/```\n?/g, '').trim();

      return NextResponse.json({ html });
    } catch (geminiError) {
      // Si Gemini falla (key inválida, cuota, etc.) usar plantilla de fallback
      console.warn('Gemini API falló, usando fallback:', geminiError);
      const html = buildFallbackHTML(nombre, sector, productos, estilo);
      return NextResponse.json({ html });
    }
  } catch (error) {
    console.error('Error generando página:', error);
    return NextResponse.json({ error: 'Error generando la página' }, { status: 500 });
  }
}
