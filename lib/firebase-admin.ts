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
        
        // 1. Detect if the user pasted the entire JSON by mistake
        if (privateKey.trim().startsWith('{')) {
            try {
                const json = JSON.parse(privateKey.trim());
                if (json.private_key) {
                    privateKey = json.private_key;
                }
            } catch (e) {
                console.error('FIREBASE_ADMIN: Failed to parse private key as JSON even though it starts with {');
            }
        }

        // 2. Standardize newlines (handle both literal \n and real newlines)
        privateKey = privateKey.replace(/\\n/g, '\n');
        
        // 3. Remove all types of surrounding quotes (escaped or literal)
        privateKey = privateKey.trim().replace(/^['"]+|['"]+$/g, '');

        // 4. Final safety check: ensure headers exist if it's a PEM
        if (privateKey && !privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
            // If it looks like base64 but missing headers, wrap it (rare but possible)
            if (privateKey.length > 500) {
                 privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`;
            }
        }

        // Final trim
        privateKey = privateKey.trim();

        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
            });
            console.log('FIREBASE_ADMIN: Initialized successfully');
        } catch (initErr: any) {
            console.error('FIREBASE_ADMIN: Critical initialization error:', initErr.message);
            throw initErr; // Re-throw to be caught by the API route
        }
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
