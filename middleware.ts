import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();

    // REDIRECCIÓN 301 DE RUTAS ANTIGUAS
    // Si la persona usa un link viejo a /disena-tu-pagina, mándalo a la nueva /ia
    if (url.pathname === '/disena-tu-pagina') {
        url.pathname = '/ia';
        return NextResponse.redirect(url);
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
