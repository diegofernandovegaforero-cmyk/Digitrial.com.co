'use client';
import { motion } from 'framer-motion';

export default function AnnouncementBar() {
    const text = "⚡ Sin plantillas prefabricadas ⚡ Tu programador IA de $199 USD trabaja gratis para ti ⚡ Diseños únicos en 15 segundos con código real 🚀 FASE DE LANZAMIENTO: 50% DE DESCUENTO 🚀 Anímate a diseñar tu web: Sencillo, rápido y GRATIS 👇";

    // Repetimos el texto para asegurar una transición suave y continua
    const repeatedText = `${text} \u00A0\u00A0\u00A0\u00A0 ${text} \u00A0\u00A0\u00A0\u00A0 ${text}`;

    return (
        <div className="relative w-full bg-purple-600 overflow-hidden py-3 z-[60] select-none border-b border-purple-500/30">
            <div className="flex whitespace-nowrap">
                <motion.div
                    animate={{ x: [0, "-33.33%"] }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="flex shrink-0 items-center"
                >
                    <span className="text-white font-bold text-sm md:text-base tracking-wide uppercase px-4">
                        {repeatedText}
                    </span>
                    <span className="text-white font-bold text-sm md:text-base tracking-wide uppercase px-4">
                        {repeatedText}
                    </span>
                    <span className="text-white font-bold text-sm md:text-base tracking-wide uppercase px-4">
                        {repeatedText}
                    </span>
                </motion.div>
            </div>
        </div>
    );
}
