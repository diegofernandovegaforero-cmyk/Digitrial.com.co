import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Iniciar Sesión | Digitrial",
    description: "Accede a tu panel de Digitrial. Inicia sesión de forma segura con tu correo electrónico o tu cuenta de Google y continúa escalando tu negocio digital.",
    alternates: {
        canonical: '/login',
    },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>;
}
