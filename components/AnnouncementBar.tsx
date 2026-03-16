'use client';
import { useState, useEffect } from 'react';

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

    return (
        <div className="w-full bg-purple-600 py-1.5 px-4 z-[60] select-none border-b border-purple-500/30">
            <div className="container mx-auto flex flex-wrap justify-center items-center gap-x-6 md:gap-x-12 text-[10px] md:text-[11px] font-bold text-white uppercase tracking-wider text-center">
                <div className="flex items-center gap-2">
                    <span className="text-purple-200">⚡</span>
                    <span>Sin plantillas prefabricadas</span>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                    <span className="text-purple-200">⚡</span>
                    <span>Diseños únicos en 15s con I.A</span>
                </div>

                <div className="flex items-center gap-2 bg-white/10 px-3 py-0.5 rounded-full border border-white/20">
                    <span className="animate-pulse text-red-400">🚀</span>
                    <span>50% Descuento</span>
                    <span className="mx-1 text-purple-300">|</span>
                    <span className="text-purple-100">{countdownText}</span>
                </div>

                <div className="hidden lg:flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span>8 Cupos disponibles hoy</span>
                </div>


            </div>
        </div>
    );
}
