import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Crea tu Web con IA al Instante | Digitrial",
    description: "Nuestra IA en Digitrial lo crea al instante, sin programar, lista para más ventas...",
    alternates: {
        canonical: '/ia/',
    },
};

export default function DisenaTuPaginaLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>;
}
