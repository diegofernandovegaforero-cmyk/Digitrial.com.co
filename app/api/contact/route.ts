import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Here you would typically integrate with an email service like Resend, SendGrid, or Nodemailer.
        // Since we don't have API keys, we'll log the data and return a success response.

        console.log('Contact Form Submission:', data);

        return NextResponse.json(
            { message: 'Mensaje recibido correctamente. Nos pondremos en contacto pronto.' },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: 'Error al procesar la solicitud.', error: String(error) },
            { status: 500 }
        );
    }
}
