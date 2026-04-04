import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Crea tu Web con IA al Instante y Vende Más | Digitrial",
    description: "Nuestra IA en Digitrial lo crea al instante, sin programar, lista para más ventas. Inicia sesión de forma segura con Google o correo y empieza hoy.",
    alternates: {
        canonical: '/ia',
    },
};

export default function DisenaTuPaginaLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>;
}
