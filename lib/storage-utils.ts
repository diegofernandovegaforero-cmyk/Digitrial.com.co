import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Sube una imagen (Base64 o Blob) a Firebase Storage y retorna la URL pública.
 * @param data Base64 string o Blob de la imagen
 * @param path Ruta en storage (ej: 'usuarios/email/imagenes/img_1.jpg')
 */
export const uploadImageToStorage = async (data: string | Blob, path: string): Promise<string> => {
    try {
        const storageRef = ref(storage, path);
        let blob: Blob;

        if (typeof data === 'string') {
            // Convertir Base64 a Blob
            const response = await fetch(data);
            blob = await response.blob();
        } else {
            blob = data;
        }

        const snapshot = await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image to Storage:', error);
        throw error;
    }
};

/**
 * Procesa un HTML buscando imágenes en Base64, las sube a Storage y reemplaza con CRURLs.
 * Esto reduce drásticamente el tamaño del documento en Firestore.
 */
export const optimizeHtmlImages = async (html: string, userEmail: string): Promise<string> => {
    let optimizedHtml = html;
    const base64Regex = /src="data:image\/[a-zA-Z]+;base64,[^"]+"/g;
    const matches = html.match(base64Regex);

    if (!matches) return html;

    console.log(`Optimizando ${matches.length} imágenes en el HTML...`);

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const base64Data = match.substring(5, match.length - 1); // Extraer solo el contenido de src
        
        try {
            const fileName = `img_${Date.now()}_${i}.webp`;
            const storagePath = `maquetas/${userEmail.replace(/[.#$[\]]/g, '_')}/${fileName}`;
            const firebaseUrl = await uploadImageToStorage(base64Data, storagePath);
            
            // Reemplazar la data-url pesada por la URL de Firebase ligera
            optimizedHtml = optimizedHtml.split(base64Data).join(firebaseUrl);
        } catch (err) {
            console.warn(`No se pudo optimizar la imagen ${i}, se mantendrá en Base64:`, err);
        }
    }

    return optimizedHtml;
};
