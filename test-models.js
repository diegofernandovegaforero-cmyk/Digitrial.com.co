const { loadEnvConfig } = require('@next/env');
const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found");
        return;
    }

    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey);
        const data = await response.json();
        console.log("Models:", data.models.map(m => m.name));
    } catch (error) {
        console.error("Fetch models failed:", error);
    }
}

main();
