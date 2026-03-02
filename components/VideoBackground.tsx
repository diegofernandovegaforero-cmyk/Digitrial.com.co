'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const videos = [
    {
        url: "https://videos.pexels.com/video-files/3769033/3769033-hd_1920_1080_25fps.mp4", // Gastronomía
        category: "Gastronomía"
    },
    {
        url: "https://videos.pexels.com/video-files/3694919/3694919-uhd_1440_2560_30fps.mp4", // Fitness
        category: "Fitness"
    },
    {
        url: "https://videos.pexels.com/video-files/3066459/3066459-uhd_2732_1440_24fps.mp4", // Automotriz
        category: "Automotriz"
    },
    {
        url: "https://videos.pexels.com/video-files/3129595/3129595-uhd_2560_1440_30fps.mp4", // Tecnología
        category: "Tecnología"
    }
];

export default function VideoBackground() {
    const [index, setIndex] = useState(0);
    const canvasRef = useRef<HTMLDivElement>(null);

    // Cambio automático de video cada 12 segundos
    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % videos.length);
        }, 12000);
        return () => clearInterval(timer);
    }, []);

    // Lógica de visibilidad por scroll (idéntica a la anterior para consistencia)
    useEffect(() => {
        const container = canvasRef.current;
        if (!container) return;

        function syncVisibility() {
            if (!container) return;
            const isDark = document.body.classList.contains('page-dark');

            if (isDark) {
                container.style.opacity = '1';
            } else {
                const scrollY = window.scrollY;
                const baseOpacity = 0.15; // Visibilidad mínima al inicio
                const maxOpacity = 0.45; // Máxima visibilidad sutil
                const scrollRange = 400;
                const calculatedOpacity = baseOpacity + Math.min(maxOpacity - baseOpacity, (scrollY / scrollRange) * (maxOpacity - baseOpacity));
                container.style.opacity = calculatedOpacity.toString();
            }
        }

        syncVisibility();
        const observer = new MutationObserver(syncVisibility);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        window.addEventListener('scroll', syncVisibility, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', syncVisibility);
        };
    }, []);

    return (
        <div
            ref={canvasRef}
            className="fixed inset-0 z-[-1] pointer-events-none transition-opacity duration-700"
            style={{ opacity: 0 }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0"
                >
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src={videos[index].url} type="video/mp4" />
                    </video>
                    {/* Overlay para facilitar lectura */}
                    <div className="absolute inset-0 bg-slate-900/30 dark:bg-slate-950/60 backdrop-blur-[2px]" />
                </motion.div>
            </AnimatePresence>

            {/* Viñeta sutil */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </div>
    );
}
