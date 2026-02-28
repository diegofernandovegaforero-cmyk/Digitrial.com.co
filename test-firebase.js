const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function testFirebase() {
    try {
        console.log("Config keys exist:", {
            apiKey: !!firebaseConfig.apiKey,
            projectId: firebaseConfig.projectId
        });

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        console.log("Intentando leer documento aleatorio...");
        const docRef = doc(db, 'usuarios_leads', 'test_123');
        await getDoc(docRef);
        console.log("¡Conexión exitosa a Firestore!");
    } catch (error) {
        console.error("Error conectando a Firestore:", error.message);
    }
}

testFirebase();
