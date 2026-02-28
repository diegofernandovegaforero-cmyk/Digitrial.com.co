import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { getAdminDbSafe } from '@/lib/firebase-admin';

// Sanitizar email igual que en el frontend
const emailToDocId = (email: string) =>
    email.toLowerCase().trim().replace(/[.#$[\\]]/g, '_');

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;

    // Verificar Firebase
    const db = getAdminDbSafe();
    if (!db) {
        return NextResponse.json({ error: 'Firebase no configurado en el servidor.' }, { status: 503 });
    }

    try {
        const { email, instruccion_texto, id_diseno_base } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Se requiere el correo electrónico.' }, { status: 400 });
        }

        const docId = emailToDocId(email);
        let docRef = db.collection('usuarios_leads').doc(docId);
        let docSnap = await docRef.get();

        // ── Compatibilidad hacia atrás: Si no existe por email, buscar por UID de Firebase ──
        if (!docSnap.exists) {
            // Asumimos que si no lo encuentra, tal vez la página se haya generado ANTES de nuestra 
            // actualización que unifica los IDs por email. Busquemos un documento cuyo campo 'email' coincida.
            const querySnapshot = await db.collection('usuarios_leads').where('email', '==', email.toLowerCase().trim()).limit(1).get();
            if (!querySnapshot.empty) {
                docRef = querySnapshot.docs[0].ref;
                docSnap = await docRef.get();
            } else {
                return NextResponse.json({ error: 'Usuario no encontrado. Genera primero tu página web.' }, { status: 404 });
            }
        }

        const userData = docSnap.data()!;
        const creditos = userData.creditos_restantes ?? 0;

        if (creditos < 3) {
            return NextResponse.json(
                { error: 'Créditos insuficientes. Contacta a un asesor para recargar.', creditos_restantes: creditos },
                { status: 402 }
            );
        }

        // Si el usuario seleccionó un diseño antiguo del historial, lo buscamos.
        let codigoActual = userData.codigo_actual || '';
        if (id_diseno_base && userData.historial_disenos) {
            const disenoAntiguo = userData.historial_disenos.find((d: any) => d.id === id_diseno_base);
            if (disenoAntiguo) {
                codigoActual = disenoAntiguo.codigo_actual;
            }
        }

        const nuevosCreditos = creditos - 3;

        // ── Construir instrucción final ──
        const instruccionFinal = instruccion_texto || '';
        if (!instruccionFinal.trim()) {
            return NextResponse.json({ error: 'No se recibió ninguna instrucción de edición.' }, { status: 400 });
        }

        // ── Prompt Maestro de Edición ──
        const promptEdicion = `
Eres el Desarrollador Front-End Senior de Digitrial centro de soluciones.

Se te entrega el código HTML actual de una landing page y una instrucción del cliente para modificarla.

IMPORTANTE - REGLA DE IMÁGENES:
Si vas a agregar o reemplazar imágenes, está ESTRICTAMENTE PROHIBIDO usar Unsplash, Pollinations u otros. Tu ÚNICO proveedor de imágenes es nuestro proxy interno de Pexels.
Usa EXACTAMENTE esta estructura para el 'src' de la imagen:
<img src="/api/pexels?q=[palabras+clave+en+ingles+separadas+por+signo+mas]" alt="..." class="...">

CÓDIGO HTML ACTUAL:
${codigoActual}

INSTRUCCIÓN DE CLIENTE: "${instruccion_texto}"

CRÉDITOS RESTANTES DEL CLIENTE (después de esta edición): ${nuevosCreditos}

REGLAS ESTRICTAS DE SALIDA:
- Devuelve SOLO el HTML completo modificado.
- PROHIBIDO usar Markdown. NO uses \`\`\`html ni \`\`\`.
- Tu respuesta debe comenzar EXACTAMENTE con <!DOCTYPE html> y terminar con </html>.
- Mantén TODAS las secciones existentes a menos que el cliente pida eliminarlas expresamente.
- ¡CRÍTICO Y VITAL! SI AGREGAS O MODIFICAS IMÁGENES, DEBES UTILIZAR ÚNICAMENTE NUESTRO PROXY DE PEXELS COMO PROVEEDOR PROFESIONAL:
  1. 'src' principal (SISTEMA PREMIUM - PROVEEDOR UNICO): /api/pexels?q=[palabras+clave+en+ingles+separadas+por+signo+mas]
  ¡ESTÁ TERMINANTEMENTE PROHIBIDO usar Unsplash, Pollinations, Nano Banana o LoremFlickr! Confía en el proxy de Pexels.
  Ejemplo: <img src="/api/pexels?q=office+modern+team" alt="Equipo profesional">
- ¡VIDEOS DE STOCK (Stick de vids)! Si necesitas fondos en video, usa <video autoplay loop muted playsinline>: https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-4174-large.mp4 o https://assets.mixkit.co/videos/preview/mixkit-people-in-a-business-meeting-working-on-a-project-4180-large.mp4 o https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-laptop-in-a-coffee-shop-4171-large.mp4 o https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-connection-background-27202-large.mp4
- ¡CRÍTICO! NO ELIMINES NI REEMPLACES las imágenes de fondo (<img> o background-image) por simples gradientes o colores estáticos. Mantén el diseño rico y estructurado con una paleta de colores adaptada al giro del negocio.
- ¡ATENCIÓN A LOS COLORES! La paleta de colores (oscuro, claro, colores específicos) DEBE estar estrictamente condicionada por la instrucción de audio o texto. Si el cliente pide colores claros, quita el dark mode; si pide colores específicos, aplícalos en el CSS.
- Mantén el carácter dinámico de la página web (GSAP, AOS, Framer Motion, microinteracciones, animaciones de entrada).
- ¡ELIMINA CUALQUIER PANTALLA DE CARGA (LOADING SCREEN)! Si el código actual tiene un preloader, spinner, overlay oscuro o pantalla de carga (con 0-100%, opacidad 0 inicial, etc.), ELIMÍNALO por completo en tu respuesta. El sitio debe mostrarse y renderizarse inmediatamente sin retrasos.
- Alerta al final: Si los créditos restantes mencionados arriba son 0 o 3, DEBES incluir un banner sutil, elegante y muy premium pegado encima del footer actual que diga exactamente: "Atención: Te quedan {{creditos_restantes}} créditos de edición. Contacta a un asesor para llevar este diseño a producción o recargar tu cuenta." Reemplaza {{creditos_restantes}} por el número real.

Ejecuta los cambios solicitados sobre el código HTML respetando las paletas de colores pedidas y devuelve el nuevo documento renderizado.
        `.trim();

        if (!apiKey) {
            return NextResponse.json({ error: 'API key de Gemini no configurada.' }, { status: 503 });
        }

        const customGoogle = createGoogleGenerativeAI({
            apiKey: apiKey,
        });

        const result = streamText({
            model: customGoogle('gemini-1.5-pro'),
            prompt: promptEdicion,
            onFinish: async ({ text }) => {
                const nuevoHtml = text.replace(/```html/gi, '').replace(/```/g, '').trim();
                const dbForUpdate = getAdminDbSafe();
                if (dbForUpdate) {
                    let historial = userData.historial_disenos || [];

                    // Migración silenciosa
                    if (historial.length === 0 && userData.codigo_actual) {
                        historial.push({
                            id: (Date.now() - 1000).toString(),
                            codigo_actual: userData.codigo_actual,
                            descripcion: userData.descripcion || 'Diseño base',
                            fecha: userData.ultima_edicion || userData.fecha_creacion || new Date().toISOString()
                        });
                    }

                    historial.unshift({
                        id: Date.now().toString(),
                        codigo_actual: nuevoHtml,
                        descripcion: instruccion_texto ? instruccion_texto.substring(0, 200) : 'Edición de texto',
                        fecha: new Date().toISOString()
                    });

                    historial = historial.slice(0, 8); // Guardar historial de 8 maximo

                    await dbForUpdate.collection('usuarios_leads').doc(docRef.id).update({
                        codigo_actual: nuevoHtml,
                        historial_disenos: historial,
                        creditos_restantes: nuevosCreditos,
                        ultima_edicion: new Date().toISOString(),
                        instruccion_texto: instruccion_texto || '',
                    });
                }
            },
        });

        // Retornamos el stream. Adicionalmente, podríamos retornar cabeceras extra si se necesitan.
        return result.toTextStreamResponse({
            headers: {
                'x-creditos-restantes': nuevosCreditos.toString()
            }
        });

    } catch (error) {
        console.error('Error editando página:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
