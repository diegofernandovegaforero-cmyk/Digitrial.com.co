'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const videos = [
    // Videos Locales (Nuevos)
    { url: "/videos/RESTAURANTE.mp4", category: "Restauración" },
    { url: "/videos/HAMBURGUESA.mp4", category: "Hamburguesa Gourmet" },
    { url: "/videos/GIMNASIO 2.mp4", category: "Fitness & Gimnasio" },
    { url: "/videos/PLATANO.mp4", category: "Plátano" },
    { url: "/videos/CAFEMOLIDO.mp4", category: "Café Molido" },
    { url: "/videos/ABARROTES.mp4", category: "Abarrotes" },
    // Videos Externos (Existentes)
    {
        url: "https://videos.pexels.com/video-files/3769033/3769033-hd_1920_1080_25fps.mp4",
        category: "Gastronomía"
    },
    {
        url: "https://videos.pexels.com/video-files/4121625/4121625-uhd_2560_1440_25fps.mp4",
        category: "Supermercado"
    },
    {
        url: "https://videos.pexels.com/video-files/3853624/3853624-hd_1920_1080_25fps.mp4",
        category: "Plaza de Mercado"
    },
    {
        url: "https://videos.pexels.com/video-files/7125322/7125322-uhd_2560_1440_25fps.mp4",
        category: "Finca de Café"
    },
    {
        url: "https://videos.pexels.com/video-files/8274530/8274530-uhd_3840_2160_25fps.mp4",
        category: "Cultivo de Aguacate"
    },
    {
        url: "https://videos.pexels.com/video-files/35793608/35793608-hd_1920_1080_24fps.mp4",
        category: "Cultivo de Mandarinas"
    },
];

export default function VideoBackground({ targetRef }: { targetRef?: React.RefObject<HTMLDivElement | null> }) {
    const [index, setIndex] = useState(0);
    const { scrollYProgress } = useScroll({
        target: targetRef as React.RefObject<HTMLElement>,
        offset: ["start end", "end start"]
    });

    // Opacidad suavizada rápida: Revelación y ocultamiento más veloces
    const opacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);

    // Cambio automático de video cada 12 segundos
    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % videos.length);
        }, 12000);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            style={{ opacity }}
            className="fixed inset-0 w-full h-full overflow-hidden bg-slate-950 shadow-2xl z-0 pointer-events-none"
        >
            <AnimatePresence>
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover"
                    >
                        <source src={videos[index].url} type="video/mp4" />
                    </video>
                    {/* Overlay semi-transparente para legibilidad */}
                    <div className="absolute inset-0 bg-slate-900/40" />
                </motion.div>
            </AnimatePresence>

            {/* Viñeta sutil interna */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] pointer-events-none" />
        </motion.div>
    );
}
