'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AnnouncementBar() {
    const [timeLeft, setTimeLeft] = useState({ days: 5, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        // Lógica para un ciclo de 5 días que se reinicia
        // Usamos una referencia de tiempo persistente (LocalStorage o simplemente el tiempo actual)
        // Para este prototipo, simularemos que faltan 5 días desde el primer acceso
        const CYCLE_MS = 5 * 24 * 60 * 60 * 1000;
        const now = Date.now();

        let targetTime = localStorage.getItem('announcement_target');
        if (!targetTime || now > parseInt(targetTime)) {
            const newTarget = now + CYCLE_MS;
            localStorage.setItem('announcement_target', newTarget.toString());
            targetTime = newTarget.toString();
        }

        const interval = setInterval(() => {
            const currentTime = Date.now();
            const diff = parseInt(targetTime!) - currentTime;

            if (diff <= 0) {
                const newTarget = Date.now() + CYCLE_MS;
                localStorage.setItem('announcement_target', newTarget.toString());
                targetTime = newTarget.toString();
            } else {
                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const m = Math.floor((diff / (1000 * 60)) % 60);
                const s = Math.floor((diff / 1000) % 60);
                setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const countdownText = `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;
    const mainText = "⚡ Sin plantillas prefabricadas ⚡ Diseños únicos en 15 segundos con I.A 🚀 FASE DE LANZAMIENTO: 50% DE DESCUENTO 🚀 TERMINA EN:";
    const fullText = `${mainText} ${countdownText}`;

    // Repetimos el texto para asegurar una transición suave y continua
    const repeatedText = `${fullText} \u00A0\u00A0\u00A0\u00A0 ${fullText} \u00A0\u00A0\u00A0\u00A0 ${fullText}`;

    return (
        <div className="relative w-full bg-purple-600 overflow-hidden py-2 z-[60] select-none border-b border-purple-500/30">
            <div className="flex whitespace-nowrap">
                <motion.div
                    animate={{ x: [0, "-33.33%"] }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="flex shrink-0 items-center"
                >
                    <span className="text-white font-bold text-xs md:text-sm tracking-wide uppercase px-4 flex items-center gap-2">
                        {repeatedText}
                    </span>
                    <span className="text-white font-bold text-xs md:text-sm tracking-wide uppercase px-4 flex items-center gap-2">
                        {repeatedText}
                    </span>
                    <span className="text-white font-bold text-xs md:text-sm tracking-wide uppercase px-4 flex items-center gap-2">
                        {repeatedText}
                    </span>
                </motion.div>
            </div>
        </div>
    );
}
