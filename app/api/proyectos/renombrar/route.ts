import { NextRequest, NextResponse } from 'next/server';
import { getAdminDbSafe } from '@/lib/firebase-admin';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { email, proyectoId, nuevoNombre } = await req.json();

    if (!email || !proyectoId || !nuevoNombre) {
      return NextResponse.json({ error: 'Faltan campos (email, proyectoId, nuevoNombre).' }, { status: 400 });
    }

    const adminDb = await getAdminDbSafe();
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not configured.' }, { status: 500 });
    }

    const emailKey = email.toLowerCase().trim().replace(/[.#$[\]]/g, '_');
    const docRef = adminDb.collection('maquetasweb_usuarios').doc(emailKey);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    const data = snap.data() || {};
    let historial = data.historial_disenos || [];

    // Find the project index in the array
    const projIndex = historial.findIndex((p: any) => p.id === proyectoId.toString());

    if (projIndex === -1) {
      return NextResponse.json({ error: 'Proyecto no encontrado en el historial.' }, { status: 404 });
    }

    // Update the name
    historial[projIndex].nombre_negocio = nuevoNombre;

    // Save back to Firestore
    await docRef.update({
      historial_disenos: historial
    });

    return NextResponse.json({ success: true, message: 'Proyecto renombrado con éxito.' });

  } catch (error: any) {
    console.error('Error al renombrar proyecto:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
