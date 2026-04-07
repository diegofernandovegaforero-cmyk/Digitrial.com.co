import { NextRequest, NextResponse } from 'next/server';

// Firebase Admin helper
const getAdminDb = async () => {
    if (!process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID === 'TU_PROYECTO_ID') {
        return null;
    }
    const { getAdminDbSafe } = await import('@/lib/firebase-admin');
    return getAdminDbSafe();
};

export async function POST(req: NextRequest) {
    try {
        const { email, html, descripcion, rid, isFree } = await req.json();

        if (!email || !html) {
            return NextResponse.json({ error: 'Faltan campos requeridos (email/html).' }, { status: 400 });
        }

        const adminDb = await getAdminDb();
        if (!adminDb) {
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        const emailKey = email.toLowerCase().trim().replace(/[.#$[\]]/g, '_');
        const docRef = adminDb.collection('maquetasweb_usuarios').doc(emailKey);
        
        // 1. Verificar créditos
        const snap = await docRef.get();
        if (!snap.exists) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        const userData = snap.data() || {};
        const creditosActuales = userData.creditos_restantes ?? 0;

        if (!isFree && creditosActuales < 1) {
            return NextResponse.json({ error: 'Créditos insuficientes (1 crédito por guardado).' }, { status: 402 });
        }

        // 2. Idempotencia: No cobrar si ya se procesó este rid
        if (rid && userData.last_rid === rid) {
            console.log(`[GUARDADO MANUAL] Rid ${rid} ya cobrado. Saltando.`);
            return NextResponse.json({ success: true, creditos_restantes: creditosActuales });
        }

        const { getAdminFieldValue } = await import('@/lib/firebase-admin');
        const FieldValue = getAdminFieldValue();
        const historyId = Date.now().toString();

        // 3. Guardar en historial_codigos (subcolección)
        await docRef.collection('historial_codigos').doc(historyId).set({
            codigo_html: html,
            fecha: new Date().toISOString()
        });

        // 4. Actualizar metadata y cobrar crédito
        let historial = userData.historial_disenos || [];
        const meta = {
            id: historyId,
            descripcion: descripcion || "Guardado manual de diseño",
            fecha: new Date().toISOString(),
            has_separate_code: true
        };
        historial = [meta, ...historial].slice(0, 10);

        const updateData: any = {
            last_rid: rid || null,
            ultima_edicion: new Date().toISOString(),
            historial_disenos: historial
        };

        if (!isFree) {
            updateData.creditos_restantes = FieldValue.increment(-1);
        }

        // Solo guardar código actual si es < 800KB para Firestore
        if (Buffer.byteLength(html, 'utf8') < 800000) {
            updateData.codigo_actual = html;
        }

        await docRef.update(updateData);
        const finalCredits = isFree ? creditosActuales : creditosActuales - 1;
        console.log(`[GUARDADO MANUAL] Éxito: ${isFree ? '0' : '1'} crédito descontado para ${email}`);

        return NextResponse.json({ 
            success: true, 
            creditos_restantes: finalCredits,
            historyId 
        }, {
            headers: {
                'x-creditos-restantes': finalCredits.toString()
            }
        });

    } catch (error: any) {
        console.error('Error fatal en API de guardado manual:', error);
        return NextResponse.json({ error: error.message || 'Error interno al guardar.' }, { status: 500 });
    }
}
