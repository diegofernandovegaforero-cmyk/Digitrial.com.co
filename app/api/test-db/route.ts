import { NextResponse } from 'next/server';
import { getAdminDbSafe } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const db = getAdminDbSafe();
        if (!db) return NextResponse.json({ error: 'No db' });

        const snapshot = await db.collection('usuarios_leads').get();
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            email: doc.data().email,
            creditos: doc.data().creditos_restantes
        }));

        return NextResponse.json({ count: data.length, data });
    } catch (e) {
        return NextResponse.json({ error: String(e) });
    }
}
