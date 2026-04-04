import type { Metadata } from "next";
import { Inter, Outfit, Anton } from "next/font/google";
import "./globals.css";
import ScrollThemeProvider from "@/components/ScrollThemeProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });

export const metadata: Metadata = {
    metadataBase: new URL('https://digitrial.com.co'),
    title: "Crea Tu Web En Minutos | Digitrial",
    description: "Construye la confianza sólida para tu empresa con el respaldo de manos expertas.",
    alternates: {
        canonical: '/',
    },
    icons: {
        icon: '/favicon.svg',
        apple: '/icon.png',
    },
    verification: {
        google: "kqOFsjCL9xEiGycDMKCV_A7wZgzLJUT2-9pffthHiFg",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={`${inter.variable} ${outfit.variable} ${anton.variable} font-sans`} style={{ position: 'relative' }}>
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
