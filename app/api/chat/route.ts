import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
    try {
        const { message, history } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'PEGA_TU_API_KEY_AQUI') {
            return NextResponse.json({ 
                text: "Lo siento, mi conexión con la inteligencia central de Digitrial no está configurada. Por favor, asegúrate de tener una GEMINI_API_KEY válida." 
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Usando un modelo estable
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            systemInstruction: `Eres DIGIT, el Arquitecto Web de Inteligencia Artificial de Digitrial.com.co.
            Tu misión es ayudar a los usuarios a crear sitios web de alto impacto, modernos y dinámicos.
            
            Personalidad:
            - Eres profesional, amable y extremadamente creativo.
            - Hablas con entusiasmo sobre el diseño web y la tecnología.
            - Siempre te identificas como DIGIT.
            - Tu tono es inspirador y servicial.
            
            Conocimiento sobre Digitrial:
            - Digitrial permite crear páginas web profesionales en minutos usando IA.
            - Ofrecemos diseños premium, integración con Pexels para imágenes reales, animaciones fluidas y optimización SEO.
            - Los usuarios pueden diseñar su página describiendo su idea.
            
            Reglas de respuesta:
            - Mantén tus respuestas concisas y directas al punto (máximo 2-3 párrafos).
            - Usa un lenguaje que el usuario pueda entender, evitando tecnicismos excesivos a menos que sea necesario.
            - Si te preguntan algo fuera del contexto de diseño web o Digitrial, trata de redirigir la conversación amablemente hacia cómo Digitrial puede ayudarles en su presencia digital.
            - Siempre firma o despídete de forma cordial.`
        });

        // Convertir historial al formato de Gemini si es necesario
        // Por ahora, solo usaremos el mensaje actual para simplicidad, 
        // pero podemos expandirlo a historial completo después.
        
        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        return NextResponse.json({ text: responseText });
    } catch (error: any) {
        console.error('Error en API Chat:', error);
        return NextResponse.json({ error: 'Error procesando tu consulta' }, { status: 500 });
    }
}
