import { config } from 'dotenv';
config({ path: '.env.local' });

import * as admin from 'firebase-admin';

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n');
admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
    }),
});

const db = admin.firestore();

async function checkUser(email: string) {
    const emailKey = email.toLowerCase().trim().replace(/[.#$[\]]/g, '_');
    console.log(`Searching for: ${emailKey}`);
    const docRef = db.collection('maquetasweb_usuarios').doc(emailKey);
    const doc = await docRef.get();
    
    if (!doc.exists) {
        // Fallback backward search via query
        console.log(`Direct lookup failed. Trying query by email field...`);
        const snapshot = await db.collection('maquetasweb_usuarios').where('email', '==', email.toLowerCase().trim()).get();
        if (snapshot.empty) {
             console.log(`No user found for email: ${email}`);
             process.exit(0);
        } else {
             const data = snapshot.docs[0].data();
             printData(data);
             process.exit(0);
        }
    } else {
        const data = doc.data()!;
        printData(data);
        process.exit(0);
    }
}

function printData(data: any) {
    console.log(`\n=============================`);
    console.log(`User: ${data.nombre_negocio || data.nombre_contacto}`);
    console.log(`Email in DB: ${data.email}`);
    console.log(`Credits remaining: ${data.creditos_restantes}`);
    
    const mockups = data.historial_disenos || [];
    console.log(`Found ${mockups.length} mockups in history.`);
    mockups.forEach((m: any, i: number) => {
        console.log(`\n--- Mockup ${i + 1} ---`);
        console.log(`ID: ${m.id}`);
        console.log(`Date: ${m.fecha}`);
        console.log(`Description: ${m.descripcion}`);
    });
    console.log(`=============================\n`);
}

checkUser('difor27@hotmail.com').catch(console.error);
