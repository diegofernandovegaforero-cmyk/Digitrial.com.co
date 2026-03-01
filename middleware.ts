import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const hostname = req.headers.get('host') || '';

    // Si el usuario entra al subdominio IA
    if (hostname === 'ia.digitrial.com.co' || hostname.startsWith('ia.digitrial')) {
        // Y están yendo a la raíz (ia.digitrial.com.co/)
        if (url.pathname === '/') {
            // Reescribimos silenciosamente a nuestra ruta real de la herramienta
            url.pathname = '/disena-tu-pagina';
            return NextResponse.rewrite(url);
        }
        // Si intentan ir a /disena-tu-pagina dentro del subdominio, los mandamos a la raiz limpia del subdominio
        if (url.pathname === '/disena-tu-pagina') {
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    }

    // REDIRECCIÓN 301 DE RUTAS ANTIGUAS
    // Si la persona entra a la página web normal (www.digitrial.com.co/disena-tu-pagina)
    // la enviamos hacia el subdominio nuevo: https://ia.digitrial.com.co
    if (url.pathname === '/disena-tu-pagina' && !hostname.startsWith('ia.digitrial')) {
        const subdomainUrl = new URL('https://ia.digitrial.com.co');
        return NextResponse.redirect(subdomainUrl);
    }

    return NextResponse.next();
}

// Opcional: configurar en qué rutas corre el middleware para ahorrar recursos
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
