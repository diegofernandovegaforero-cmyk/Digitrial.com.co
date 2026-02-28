const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        })
    });
}
const db = admin.firestore();

async function check() {
    const snapshot = await db.collection('usuarios_leads').get();
    console.log(`Total docs: ${snapshot.size}`);
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id}`);
        console.log(`Email: ${data.email || 'NO EMAIL'}`);
        console.log(`Nombre: ${data.nombre_negocio || 'NO NOMBRE'}`);
        console.log(`Creditos: ${data.creditos_restantes}`);
        console.log('---');
    });
}

check().catch(console.error);
