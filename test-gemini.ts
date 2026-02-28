import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadEnvConfig } from '@next/env';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

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

3. IMÁGENES Y CONTENIDO:
Integración de Imágenes: Incorporar imágenes relevantes y de alta calidad estratégicamente (usando por ejemplo https://source.unsplash.com/1600x900/?[keyword]) para mejorar el atractivo visual y la narración. Mencione explícitamente contenido visual de stock o placeholders para IA. TODA sección principal y sub-elemento (como cards de servicio) debe contener recursos visuales/imágenes integradas, es PROHIBIDO usar solo color o degradado. Usa backdrop-filter: blur() (glassmorphism) para legibilidad.

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

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found");
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    try {
        const inputUsuario = "DISEÑA UN SITIO WEB SIMILAR A ESTE https://tiendamillonarios.com.co/?srsltid=AfmBOoqCwOe28V7L...";
        console.log("Generating content...");
        const result = await model.generateContent(buildPrompt(inputUsuario));
        console.log("Success! Characters:", result.response.text().length);
        // console.log(result.response.text().substring(0, 100));
    } catch (error) {
        console.error("Gemini failed:", error);
    }
}

main();
