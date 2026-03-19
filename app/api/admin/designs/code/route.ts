import { NextRequest, NextResponse } from 'next/server';

const getAdminDb = async () => {
  const { getAdminDbSafe } = await import('@/lib/firebase-admin');
  return getAdminDbSafe();
};

const ADMIN_EMAIL = 'diegofernandovegaforero@gmail.com';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const designId = searchParams.get('id');
    const targetEmail = searchParams.get('targetEmail');

    if (!email || email.toLowerCase().trim() !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    if (!designId) {
        return NextResponse.json({ error: 'ID de diseño requerido' }, { status: 400 });
    }

    const adminDb = await getAdminDb();
    if (!adminDb) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

    let foundCode: string | null = null;

    // 1. Si tenemos el email del dueño, vamos directamente al grano (MÁS RÁPIDO)
    if (targetEmail) {
        const emailKey = targetEmail.toLowerCase().trim().replace(/[.#$[\]]/g, '_');
        const userRef = adminDb.collection('maquetasweb_usuarios').doc(emailKey);
        const userSnap = await userRef.get();

        if (userSnap.exists) {
            const data = userSnap.data() || {};
            // Caso A: Está en el doc principal (Autosave o Legacy)
            if (data.codigo_actual && (data.ultima_generacion || data.fecha_creacion || "").toString().includes(designId)) {
                foundCode = data.codigo_actual;
            }
            if (!foundCode && data.historial_disenos) {
                const match = data.historial_disenos.find((h: any) => h.id === designId);
                if (match && match.codigo_actual) foundCode = match.codigo_actual;
            }
            
            // Caso B: Está en la subcolección (Nuevo sistema)
            if (!foundCode) {
                const subSnap = await userRef.collection('historial_codigos').doc(designId).get();
                if (subSnap.exists) {
                    foundCode = subSnap.data()?.codigo_html || null;
                }
            }
        }
    }

    // 2. Si no lo encontramos o no hay targetEmail, buscamos en todos (BÚSQUEDA EXHAUSTIVA LEGACY)
    if (!foundCode) {
        const snapshot = await adminDb.collection('maquetasweb_usuarios').get();
        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (data.codigo_actual && (data.ultima_generacion || data.fecha_creacion || "").toString().includes(designId)) {
                foundCode = data.codigo_actual;
            }
            if (!foundCode && data.historial_disenos) {
                const match = data.historial_disenos.find((h: any) => h.id === designId);
                if (match) {
                    if (match.codigo_actual) {
                        foundCode = match.codigo_actual;
                    } else {
                        // Podría estar en su subcolección
                        const subSnap = await doc.ref.collection('historial_codigos').doc(designId).get();
                        if (subSnap.exists) foundCode = subSnap.data()?.codigo_html || null;
                    }
                }
            }
            if (foundCode) break;
        }
    }

    if (!foundCode) {
        return NextResponse.json({ error: 'Diseño no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ code: foundCode });
  } catch (error) {
    console.error('Error fetching design code:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
