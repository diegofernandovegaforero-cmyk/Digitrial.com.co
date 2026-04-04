import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Crea Tu Web En Minutos - Digitrial",
    description: "Webs modernas con IA en minutos · E-commerce Shopify a medida · Diseño ágil sin barreras · Multiplica. tus. ventas. hoy.",
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>;
}
