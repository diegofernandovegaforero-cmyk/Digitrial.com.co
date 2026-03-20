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
        <div className="w-full bg-transparent py-2 px-4 z-[60] select-none relative overflow-hidden group">
            <div className="container mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-center items-center gap-3 md:gap-8 text-[11px] md:text-xs font-bold text-slate-700 uppercase tracking-[0.15em] text-center">
                    
                    <div className="flex items-center gap-3">
                        <span className="text-blue-600 animate-pulse">🔥</span>
                        <span className="text-slate-600">
                            ¡No dejes pasar esta oferta! <span className="text-blue-600">50% de descuento</span> — Solo <span className="text-green-600">7 cupos</span> disponibles hoy
                        </span>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-100/50 px-4 py-1 rounded-full border border-slate-200 backdrop-blur-md shadow-inner">
                        <span className="text-slate-500">Tiempo restante:</span>
                        <span className="font-mono text-blue-600 tabular-nums">{countdownText}</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 3s infinite;
                }
            `}</style>
        </div>
    );
}
