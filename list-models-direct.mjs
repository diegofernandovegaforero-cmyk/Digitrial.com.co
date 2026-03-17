import fs from 'fs';

const apiKey = 'AIzaSyDSS3D1Ur2WQUbs0DO4OHQKGMlrY6WVa68';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
    console.log('--- Fetching models list ---');
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.models) {
            console.log('Available models:');
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log('No models found or error:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error('Fetch error:', e.message);
    }
}

listModels();
