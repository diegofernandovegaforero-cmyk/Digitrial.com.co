import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ScrollThemeProvider from "@/components/ScrollThemeProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: "Digitrial - ¡Diseña Tu Web Gratis Con I.A!",
    description: "Transformamos desafíos complejos en oportunidades de crecimiento medibles a través de tecnología y estrategia.",
    icons: {
        icon: '/favicon.svg',
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
            <body className={`${inter.variable} ${outfit.variable} font-sans`} style={{ position: 'relative' }}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    {/* Proveedor de tema oscuro al hacer scroll */}
                    <ScrollThemeProvider />

                    {/* Contenido principal */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        {children}
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
