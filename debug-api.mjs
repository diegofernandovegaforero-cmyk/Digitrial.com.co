import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyDSS3D1Ur2WQUbs0DO4OHQKGMlrY6WVa68'; // Hardcoded for 1-minute test
const genAI = new GoogleGenerativeAI(apiKey);

async function debugModel() {
    console.log('--- Debugging gemini-1.5-flash ---');
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Hello');
        console.log('✅ Success:', result.response.text());
    } catch (e) {
        console.log('❌ Error Object:', JSON.stringify(e, null, 2));
        console.log('❌ Error Message:', e.message);
        if (e.response) {
            console.log('❌ Response Status:', e.response.status);
            console.log('❌ Response Data:', await e.response.json());
        }
    }
}

debugModel();
