'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const videos = [
    {
        url: "https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-salad-in-a-professional-kitchen-862-large.mp4", // Gastronomía
        category: "Gastronomía"
    },
    {
        url: "https://assets.mixkit.co/videos/preview/mixkit-man-training-hard-in-the-gym-23424-large.mp4", // Fitness
        category: "Fitness"
    },
    {
        url: "https://assets.mixkit.co/videos/preview/mixkit-professional-mechanic-working-on-a-car-engine-4664-large.mp4", // Automotriz
        category: "Automotriz"
    },
    {
        url: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-woman-typing-on-a-laptop-406-large.mp4", // E-commerce/Tech
        category: "E-commerce"
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
                const maxOpacity = 0.35;
                const scrollRange = 300;
                const calculatedOpacity = Math.min(maxOpacity, (scrollY / scrollRange) * maxOpacity);
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
            className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-700"
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
