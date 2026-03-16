const admin = require('firebase-admin');

const privateKey = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDKzaW5lRWbeQBb\nVWX9LSggSBLm458xW4i8xQYV7zx/oA/eyPELsiHIg/XrKkO+l5RTFzsVRxEDURV/\nmDV6/UU2/vV2A3nBFh4KW7Ymw4lLCwMIJEAuhUlnxIyJWWNQeMRqmoeRr3jcTtnV\n0BRapiIrdAScuxJyJEC6rXHI7zHDdfJMpN64iMsaeIw+mc2PkcQA0LPWJF2pQ9F/\n0jOd0h4apMOxUzgh8WSHbzFWgSWygpaxGl9cCl1xaO4UQVzJcRAp3C3/tYfk62gk\nu5kzBIZwZ0wBQ446I92Y/ChLTxdJFngXsTKu8/DURJX3Zr0dd51s+HvmodaTrzz+\nkM2K651vAgMBAAECggEAOKldWK0BJPeZNGt3O9XOhLpuYYkONMWcvhUUHrPBRO0t\nEfM1ea2Sx8mqv0IHPGxwWgi/DrJU3AbfCU+2/X5exL9WSFsvPNXXndBC47C1Hrzc\nY31xWy4NNMtS8psBZv3e7uPu5bLPg0oajaT90tfg6yAWm82emTpsxVtpU5kU38WH\n1yVXPCzi2l11NM5vRf/ybZ+Tn4KYTMxUPI7oJWpk5P5CnPMsb5fzSk0kM9aS+V7U\nzIVJqJ/5ReAorPhbRaLFfVJEyF5XdG1EeA2w4YnGeK/ibQO5AM/dwAy0zYVSu15Z\nAB08MHj7UFJl7dtvcoT9f31EE4iCcJQmoutqOyvtZQKBgQD9pjizVbW4FPIl9Dra\neK4NjmA1d1GOVScjvp6loM8ULd2tyW99FLkBI4J9411WIg98BZ03uM4bwtoiuM8B\nNL/0D0xsVfghUpcCDlz38wB9NiCC+aWtdy3Zvb+qjTttuR9/hXz4LZYd01A/z+kL\nC66IpaFKpIC51HJ8vxCurg+slQKBgQDMrstuV082Li89n3i49tBbX50nFBlFIJxs\nT5w/tf6cA7RV4xxs6Gcbh/1b/dlX5rclx6cKH/coGwtxEqIJZnveQd2bx4uzVK8j\nInfPh/eQl7pUf8ZWwQ+35gX1zTPZpcKULkOhpACNeo05CQAOwB9/bvLe18RuqvFK\n0DCLmWCc8wKBgEKJ4EXrLghkNkGOmAHHtqEHwGVGL7bOz72ou6VnUetRPN3iAcUm\nMoIB9rFfe5SkyrsWHfAIIslVjDOfl24RkGlNuhaRVs4nBEYdznWc4Xv3PwAczUF8\nCiMci7MJ6ZUXAxRIyEeybbbVQC/9Mn0bS2W9TVpvXPVircXbuVyZfLMhAoGAZWpW\nMZ3hCZ9omMfjMQJZymxdmXdD7hRybNglOwwZ04OiXsvg0bV1IRcIWgQ1JHCUXovG\nICYmeCCuUqBA2ReGWGGaRA1jEr/q5yW054cfCu2izStiQqn199BpM5kxD64p8vHZ\nYMW54F/QiWoENUrMUH/QpsmR8qOQWtk8tG6SiDECgYBSYdmAxJJm9op/r4tDlAPg\nYFPWPKxr0T1pLjXoDlb6jUlYnt54JvYvHHLV9U7fjXCnxXYYobQYenMEwAFPbf5g\nIG2UV7LQtvLuarDYYvuEDq2osVEa/tu1snjjSzPqfPh+STuP/pIrmQwBpWAwqWCn\nUhC18n3OsWfIrgirSKt++Q==\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n');

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: "digitrial-fe276",
        clientEmail: "firebase-adminsdk-fbsvc@digitrial-fe276.iam.gserviceaccount.com",
        privateKey,
    }),
});

const db = admin.firestore();

async function checkAllUsers() {
    const sr = await db.collection('usuarios_leads').get();
    console.log(`Total users in DB: ${sr.size}`);
    sr.forEach(doc => {
        const data = doc.data();
        if (data.email && data.email.includes('difor')) {
            console.log('Found matching user!', doc.id, data.email);
            console.log(JSON.stringify(data.historial_disenos || [], null, 2));
        }
    });
}
checkAllUsers().catch(console.error);
