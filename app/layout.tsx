import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ParticleBackground from "@/components/ParticleBackground";
import ScrollThemeProvider from "@/components/ScrollThemeProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "DIGITRIAL - Centro de Soluciones",
    description: "Transformamos desafíos complejos en oportunidades de crecimiento medibles a través de tecnología y estrategia.",
    icons: {
        icon: '/favicon.ico',
        apple: '/icon.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={inter.className} style={{ position: 'relative' }}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    {/* Proveedor de tema oscuro al hacer scroll */}
                    <ScrollThemeProvider />
                    {/* Fondo animado de partículas — marca de agua fija en toda la página */}
                    <ParticleBackground />
                    {/* Contenido principal sobre el fondo */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        {children}
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
