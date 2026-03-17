import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import fs from 'fs';

async function debugEditor() {
    let envStr;
    try {
        envStr = fs.readFileSync('.env.local', 'utf-8');
    } catch (e) {
        envStr = fs.readFileSync('.env', 'utf-8');
    }

    const lines = envStr.split('\n');
    let apiKey = '';
    for (const line of lines) {
        if (line.trim().startsWith('GEMINI_API_KEY=')) {
            apiKey = line.trim().split('=')[1].replace(/['"]/g, '');
            break;
        }
    }

    const customGoogle = createGoogleGenerativeAI({
        apiKey: apiKey,
    });

    const codigoActual = `<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hola</h1></body></html>`;
    const instruccion_texto = "Cambia el título a 'Hola Mundo'";
    
    const promptEdicion = `
AGENTE: GEMINI 3.1 PRO

Eres el Desarrollador Front-End Senior de Digitrial centro de soluciones.
Se te entrega el código HTML actual de una landing page y una instrucción del cliente para modificarla.
CÓDIGO HTML ACTUAL:
${codigoActual}
INSTRUCCIÓN DE CLIENTE: "${instruccion_texto}"
REGLAS ESTRICTAS DE SALIDA:
- Devuelve SOLO el HTML completo modificado.
- PROHIBIDO usar Markdown. NO uses \`\`\`html ni \`\`\`.
- Tu respuesta debe comenzar EXACTAMENTE con <!DOCTYPE html> y terminar con </html>.
`.trim();

    const modelosFallback = ['gemini-3.1-pro-preview', 'gemini-2.5-pro', 'gemini-pro-latest'];
    
    console.log('Starting debug loop...');
    for (const modelName of modelosFallback) {
        try {
            console.log(`Testing model: ${modelName}`);
            const result = await streamText({
                model: customGoogle(modelName),
                messages: [{ role: 'user', content: [{ type: 'text', text: promptEdicion }] }],
            });

            console.log(`Stream started for ${modelName}. Reading first chunk...`);
            const reader = result.textStream.getReader();
            const { value, done } = await reader.read();
            console.log(`First chunk received: ${value?.substring(0, 50)}...`);
            console.log('[SUCCESS]');
            return;
        } catch (err) {
            console.warn(`Failed with ${modelName}:`, err.message);
        }
    }
}

debugEditor();
