import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
    try {
        const { businessName } = await req.json();

        if (!businessName) {
            return NextResponse.json({ error: 'Falta el nombre de la empresa para el logo' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key de Gemini no configurada.' }, { status: 503 });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                instances: [
                    {
                        prompt: `Logo vectorial, minimalista, profesional, limpio, estilo flat design, para una empresa llamada "${businessName}". Sobre un fondo blanco 100% solido. Alta resolucion. Arte digital moderno corporativo.`
                    }
                ],
                parameters: {
                    sampleCount: 1,
                    outputOptions: {
                        mimeType: "image/png"
                    }
                }
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error('Imagen API Error:', errBody);
            return NextResponse.json({ error: 'Error del modelo visual', details: errBody }, { status: response.status });
        }

        const data = await response.json();
        const base64Image = data?.predictions?.[0]?.bytesBase64Encoded;

        if (!base64Image) {
            return NextResponse.json({ error: 'El modelo no retornó una imagen válida.' }, { status: 500 });
        }

        return NextResponse.json({
            image: `data:image/png;base64,${base64Image}`
        });

    } catch (error) {
        console.error('Error in /api/generar-logo:', error);
        return NextResponse.json({ error: 'Error interno del generador de logo' }, { status: 500 });
    }
}
