import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length > 0) {
        env[key.trim()] = value.join('=').trim().replace(/^"(.*)"$/, '$1');
    }
});

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

async function listModels() {
    try {
        // Note: The SDK might not have a direct listModels method exposed plainly in all versions
        // but we can try to find it or just test a few known ones.
        console.log('--- Probando modelos comunes ---');
        const modelsToTest = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro-latest', 'gemini-1.5-flash-latest', 'gemini-2.0-flash-001'];
        
        for (const modelName of modelsToTest) {
            try {
                console.log(`Probando ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Hi');
                console.log(`✅ ${modelName} funciona.`);
                break; // Parar al primero que funcione
            } catch (e) {
                console.log(`❌ ${modelName} falló: ${e.message.substring(0, 100)}`);
            }
        }
    } catch (error) {
        console.error('Error general:', error.message);
    }
}

listModels();
