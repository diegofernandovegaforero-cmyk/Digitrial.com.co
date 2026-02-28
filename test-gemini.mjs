import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

let envStr;
try {
    envStr = fs.readFileSync('.env.local', 'utf-8');
} catch (e) {
    try {
        envStr = fs.readFileSync('.env', 'utf-8');
    } catch (e2) {
        console.error('No env file found');
        process.exit(1);
    }
}

const lines = envStr.split('\n');
let apiKey = '';
for (const line of lines) {
    if (line.trim().startsWith('GEMINI_API_KEY=')) {
        apiKey = line.trim().split('=')[1].replace(/['"]/g, '');
        break;
    }
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
    console.log(`\nTesting model: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Escribe hola y adios brevemente. Solo respondes eso, nada más.');
        console.log(`[SUCCESS] ${modelName} response:`, result.response.text());
    } catch (error) {
        console.error(`[ERROR] ${modelName} failed:`, error.message);
    }
}

async function runTests() {
    await testModel('gemini-2.5-flash');
    await testModel('gemini-2.5-pro');
}

runTests();
