import type { Metadata } from 'next';

export const metadata: Metadata = {
    description: "Nuestra IA en Digitrial lo crea al instante, sin programar, lista para más ventas...",
};

export default function DisenaTuPaginaLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>;
}
