import fetch from 'node-fetch';

async function testApi() {
    console.log('Sending request...');
    try {
        const res = await fetch('http://localhost:3000/api/generar-pagina', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                descripcion: 'Una página para un hospital veterinario de lujo',
                email: 'test@example.com'
            })
        });

        console.log('Status:', res.status);
        console.log('Headers:', res.headers.raw());

        const contentType = res.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            const data = await res.json();
            console.log('JSON Respuesta:', data);
        } else {
            console.log('Streaming body...');
            const body = res.body;
            body.on('data', chunk => {
                const text = chunk.toString();
                if (text.trim().length > 0) {
                    console.log('Chunk:', text.substring(0, 50).replace(/\n/g, ' '));
                }
            });
            body.on('end', () => console.log('Stream ended.'));
        }
    } catch (e) {
        console.error('Request failed:', e.message);
    }
}

testApi();
