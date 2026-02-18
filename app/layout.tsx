import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ParticleBackground from "@/components/ParticleBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "DIGITRIAL - Centro de Soluciones",
    description: "Transformamos desafíos complejos en oportunidades de crecimiento medibles a través de tecnología y estrategia.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={inter.className} style={{ position: 'relative' }}>
                {/* Fondo animado de partículas — marca de agua fija en toda la página */}
                <ParticleBackground />
                {/* Contenido principal sobre el fondo */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {children}
                </div>
            </body>
        </html>
    );
}
