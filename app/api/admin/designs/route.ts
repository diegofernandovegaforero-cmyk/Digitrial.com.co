import { NextRequest, NextResponse } from 'next/server';

// Firebase Admin helper
const getAdminDb = async () => {
  const { getAdminDbSafe } = await import('@/lib/firebase-admin');
  return getAdminDbSafe();
};

const ADMIN_EMAIL = 'diegofernandovegaforero@gmail.com';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    // Basic security check (ideally this should use a proper session/token)
    if (!email || email.toLowerCase().trim() !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const adminDb = await getAdminDb();
    if (!adminDb) {
      console.error('ADMIN_ERROR: Database not configured or Env Vars missing');
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    console.log('ADMIN_FETCH: Querying snapshot...');
    const snapshot = await adminDb.collection('usuarios_leads').get();
    console.log(`ADMIN_FETCH: Found ${snapshot.size} documents in usuarios_leads`);
    
    interface Design {
        id: string;
        codigo_actual: string;
        descripcion: string;
        fecha: string;
        userName: string;
        userEmail: string;
    }

    const allDesigns: Design[] = [];

    snapshot.forEach(doc => {
      try {
        const data = doc.data();
        const userName = data.nombre_contacto || data.nombre_negocio || 'Usuario';
        const userEmail = data.email || 'Sin correo';
        const historial = data.historial_disenos || [];

        // Add the current code (metadata only for list)
        if (data.codigo_actual) {
            allDesigns.push({
                id: (data.ultima_generacion || data.fecha_creacion || doc.id).toString(),
                codigo_actual: "[CODE_AVAILABLE]", 
                descripcion: "🌐 " + (data.descripcion || 'Diseño actual') + " (VIVO)",
                fecha: data.ultima_generacion || data.fecha_creacion || new Date().toISOString(),
                userName,
                userEmail
            });
        }

        historial.forEach((design: any) => {
          allDesigns.push({
            ...design,
            codigo_actual: "[CODE_AVAILABLE]", 
            userName,
            userEmail
          });
        });
      } catch (e) {
        console.error(`ADMIN_FETCH: Error processing doc ${doc.id}:`, e);
      }
    });

    console.log(`ADMIN_FETCH: Total designs processed: ${allDesigns.length}`);

    // Sort by date descending
    allDesigns.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    return NextResponse.json({ designs: allDesigns });
  } catch (error: any) {
    console.error('CRITICAL_ADMIN_API_ERROR:', error);
    return NextResponse.json({ 
      error: 'Error fetching designs', 
      details: error.message,
      stack: error.stack?.substring(0, 100) 
    }, { status: 500 });
  }
}
