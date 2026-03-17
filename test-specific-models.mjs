import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyDSS3D1Ur2WQUbs0DO4OHQKGMlrY6WVa68';
const genAI = new GoogleGenerativeAI(apiKey);

async function testNewModels() {
    const modelsToTest = ['gemini-3.1-pro-preview', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'];
    
    for (const modelName of modelsToTest) {
        console.log(`--- Testing ${modelName} ---`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Genera un botón HTML azul con Tailwind');
            console.log(`✅ Success for ${modelName}:`, result.response.text().substring(0, 100));
            // Break on first success? No, let's see if 3.1-pro works specifically
            if (modelName === 'gemini-3.1-pro-preview') console.log('This is our target model!');
        } catch (e) {
            console.log(`❌ Error for ${modelName}:`, e.message);
        }
    }
}

testNewModels();
