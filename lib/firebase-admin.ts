// lib/firebase-admin.ts
// SDK Admin de Firebase para API Routes del servidor (operaciones seguras)
// Se inicializa de forma lazy para no fallar en build con keys placeholder

let _adminDb: import('firebase-admin').firestore.Firestore | null = null;

function isConfigured() {
    const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? '';
    const project = process.env.FIREBASE_ADMIN_PROJECT_ID ?? '';
    const email = process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? '';
    return (
        project && project !== 'TU_PROYECTO_ID' &&
        email && !email.includes('TU_PROYECTO') &&
        key && !key.includes('TU_PRIVATE_KEY')
    );
}

export function getAdminDbSafe() {
    if (!isConfigured()) return null;

    if (_adminDb) return _adminDb;

    // Importación dinámica para evitar evaluación en build
    const admin = require('firebase-admin');

    if (!admin.apps.length) {
        let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
        
        // Robust cleanup: Replace escaped newlines, handle quotes, and trim
        privateKey = privateKey.replace(/\\n/g, '\n');
        
        // Remove surrounding quotes if present (standard or escaped)
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.substring(1, privateKey.length - 1);
        }
        if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
            privateKey = privateKey.substring(1, privateKey.length - 1);
        }

        // Final trim to remove any accidental trailing/leading whitespace
        privateKey = privateKey.trim();

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
                clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
    }

    _adminDb = admin.firestore();
    return _adminDb;
}

// Compatibilidad con imports existentes
export const adminDb = {
    collection: (name: string) => {
        const db = getAdminDbSafe();
        if (!db) throw new Error('Firebase Admin no configurado');
        return db.collection(name);
    }
};

/**
 * Retorna FieldValue para operaciones atómicas (como increment)
 */
export const getAdminFieldValue = () => {
    const admin = require('firebase-admin');
    return admin.firestore.FieldValue;
};
