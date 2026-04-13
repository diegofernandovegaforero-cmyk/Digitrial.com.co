import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/editor', '/admin', '/api/'],
        },
        sitemap: 'https://digitrial.com.co/sitemap.xml',
    };
}
