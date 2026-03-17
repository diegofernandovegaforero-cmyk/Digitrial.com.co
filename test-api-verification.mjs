import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

// Cargar variables de entorno desde .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length > 0) {
        env[key.trim()] = value.join('=').trim().replace(/^"(.*)"$/, '$1');
    }
});

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

async function testGeneration() {
    console.log('--- Probando Conexión con Gemini 1.5 Pro ---');
    try {
        const prompt = `
AGENTE: GEMINI 3.1 PRO
ROL: Arquitecto Web.
TAREA: Genera un HTML básico con Tailwind para una tienda de café.
REGLA: Solo HTML, sin preámbulos.
`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('Respuesta recibida correctamente.');
        console.log('Longitud de respuesta:', text.length);
        console.log('Inicio de la respuesta:', text.substring(0, 100));
        
        if (text.toLowerCase().includes('<!doctype html>')) {
            console.log('✅ VERIFICACIÓN EXITOSA: La API responde con el formato correcto.');
        } else {
            console.log('⚠️ ADVERTENCIA: La respuesta no empezó con <!DOCTYPE html>, pero hay comunicación.');
        }
    } catch (error) {
        console.error('❌ ERROR DE CONEXIÓN API:', error.message);
        process.exit(1);
    }
}

testGeneration();
