import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const orientation = searchParams.get('orientation') || 'landscape'; // landscape, portrait, square

    if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'PEXELS_API_KEY is not configured' }, { status: 500 });
    }

    try {
        const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=${orientation}`, {
            headers: {
                Authorization: apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Pexels API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.photos && data.photos.length > 0) {
            const photo = data.photos[0];
            // Preferimos la versión 'large2x' o 'large' para buena calidad
            const imageUrl = photo.src.large2x || photo.src.large || photo.src.original;

            // Redirigimos directamente a la imagen para que funcione como un <img src="...">
            return NextResponse.redirect(imageUrl);
        } else {
            // Fallback si Pexels no encuentra nada para el query
            return NextResponse.redirect(`https://placehold.co/1600x900/1e40af/ffffff?text=${encodeURIComponent(query)}`);
        }
    } catch (error) {
        console.error('Error fetching from Pexels:', error);
        return NextResponse.json({ error: 'Failed to fetch image from Pexels' }, { status: 500 });
    }
}
