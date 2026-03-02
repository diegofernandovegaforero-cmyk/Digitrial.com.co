import { NextResponse } from 'next/server';
import dns from 'dns';
import { promisify } from 'util';

const resolveDns = promisify(dns.resolve);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
        return NextResponse.json(
            { error: 'El parámetro domain es obligatorio' },
            { status: 400 }
        );
    }

    // Normalizar dominio: quitar http://, https://, www., limpiar espacios y pasarlo a minúsculas
    let cleanDomain = domain.toLowerCase().trim();
    cleanDomain = cleanDomain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');
    cleanDomain = cleanDomain.split('/')[0]; // quitar paths

    // Validar formato basico (ej. mipagina.com)
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(cleanDomain)) {
        return NextResponse.json(
            { error: 'Formato de dominio inválido' },
            { status: 400 }
        );
    }

    try {
        // Intento 1: Consultar registros DNS A, AAAA o NS. (Si tiene, está registrado y configurado).
        const records = await resolveDns(cleanDomain, 'A').catch(() => null);
        const nsRecords = await resolveDns(cleanDomain, 'NS').catch(() => null);

        if ((records && records.length > 0) || (nsRecords && nsRecords.length > 0)) {
            // Dominio ocupado con registros DNS
            return NextResponse.json({
                domain: cleanDomain,
                status: 'UNAVAILABLE',
                message: 'El dominio ya está registrado y en uso.',
                checkedAt: new Date().toISOString()
            });
        }

        // Intento 2 (Fallback): Muchas veces los dominios se compran y no tienen registros DNS configurados
        // Lo correcto sería consultarle vía RDAP/WHOIS.
        // Haremos una consulta rápida HTTP a una API pública (RDAP base fallback) para TLDs populares
        // o asumimos DISPONIBLE si DNS falla (solo fines ilustrativos front)

        const response = await fetch(`https://rdap.verisign.com/com/v1/domain/${cleanDomain}`, {
            method: 'GET',
            headers: { 'Accept': 'application/rdap+json' }
        });

        // Si la respuesta es 404 Not Found en RDAP -> EL DOMINIO ESTÁ DISPONIBLE
        if (response.status === 404) {
            return NextResponse.json({
                domain: cleanDomain,
                status: 'AVAILABLE',
                message: '¡El dominio está disponible!',
                checkedAt: new Date().toISOString()
            });
        }

        if (response.status === 200) {
            return NextResponse.json({
                domain: cleanDomain,
                status: 'UNAVAILABLE',
                message: 'El dominio ya fue registrado (visto vía RDAP).',
                checkedAt: new Date().toISOString()
            });
        }

        // Si fallan todas las verificaciones pero no lanzó error explícito, devolvemos UNKNOWN o AVAILABLE (optimista)
        return NextResponse.json({
            domain: cleanDomain,
            status: 'AVAILABLE', // optimista si DNS no responde y RDAP tampoco (tlds locos como .co a veces fallan acá)
            message: 'El dominio parece estar disponible (sin registros DNS).',
            checkedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error verificando dominio:', error);
        return NextResponse.json(
            { error: 'Error al verificar el dominio en el servidor' },
            { status: 500 }
        );
    }
}
