import fetch from 'node-fetch'; // We will use native fetch available in Node 18+
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

async function listModels() {
    console.log('Fetching available models...');
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();

        if (data.models) {
            console.log('\nAvailable Models:');
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.error('Failed to list models:', data);
        }
    } catch (e) {
        console.error('Error fetching models:', e.message);
    }
}

listModels();
