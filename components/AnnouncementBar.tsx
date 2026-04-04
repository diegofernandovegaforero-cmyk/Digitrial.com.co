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
        <div className="w-full bg-[#0B1221] py-2 px-4 z-[60] select-none border-b border-white/5 relative overflow-hidden group">
            {/* Efecto de Rejilla Profesional (Grid Pattern) */}
            <div className="absolute inset-0 opacity-20" 
                style={{ 
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                    backgroundSize: '24px 24px' 
                }} 
            />
            
            {/* Efecto Shimmer (Brillo Animado) */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

            <div className="container mx-auto relative z-10">
                <div className="flex flex-row flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[10px] sm:text-[11px] font-bold text-white uppercase tracking-[0.12em] text-center">

                    <div className="flex items-center gap-2">
                        <span className="text-blue-400 animate-pulse">🔥</span>
                        <span className="text-slate-100">
                            <span className="text-blue-400">50% OFF</span> — Solo <span className="text-green-400">7 cupos</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                        <span className="text-slate-300">Termina en:</span>
                        <span className="font-mono text-blue-400 tabular-nums">{countdownText}</span>
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
