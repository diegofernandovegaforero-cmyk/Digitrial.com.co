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

    if (!email || email.toLowerCase().trim() !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    if (!designId) {
        return NextResponse.json({ error: 'ID de diseño requerido' }, { status: 400 });
    }

    const adminDb = await getAdminDb();
    if (!adminDb) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

    const snapshot = await adminDb.collection('usuarios_leads').get();
    let foundCode = null;

    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.codigo_actual && (data.ultima_generacion || data.fecha_creacion || "").toString().includes(designId)) {
            foundCode = data.codigo_actual;
        }
        if (!foundCode && data.historial_disenos) {
            const match = data.historial_disenos.find((h: any) => h.id === designId);
            if (match) foundCode = match.codigo_actual;
        }
    });

    if (!foundCode) {
        return NextResponse.json({ error: 'Diseño no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ code: foundCode });
  } catch (error) {
    console.error('Error fetching design code:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
