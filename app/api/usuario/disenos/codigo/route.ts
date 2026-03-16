import { NextRequest, NextResponse } from 'next/server';
import { getAdminDbSafe } from '@/lib/firebase-admin';

const emailToDocId = (email: string) =>
    email.toLowerCase().trim().replace(/[.#$[\]]/g, '_');

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const id = searchParams.get('id');

    if (!email || !id) {
        return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const db = getAdminDbSafe();
    if (!db) {
        return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 });
    }

    try {
        const docId = emailToDocId(email);
        const codeRef = db.collection('usuarios_leads').doc(docId).collection('historial_codigos').doc(id);
        const snap = await codeRef.get();

        if (!snap.exists) {
            return NextResponse.json({ error: 'Diseño no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ html: snap.data()?.codigo_html || '' });
    } catch (error) {
        console.error('Error fetching design code:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
