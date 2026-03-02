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
    // Videos Externos (Existentes)
    {
        url: "https://videos.pexels.com/video-files/3769033/3769033-hd_1920_1080_25fps.mp4",
        category: "Gastronomía"
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

    // Opacidad suavizada: El video permanece oculto hasta el 35% del scroll del contenedor
    const opacity = useTransform(scrollYProgress, [0, 0.35, 0.95, 1], [0, 1, 1, 0]);

    // Animaciones para los 3 bloques de texto (Secuencial y retrasadas)
    const text1Opacity = useTransform(scrollYProgress, [0.45, 0.50, 0.60, 0.65], [0, 1, 1, 0]);
    const text1Y = useTransform(scrollYProgress, [0.45, 0.50], [20, 0]);

    const text2Opacity = useTransform(scrollYProgress, [0.68, 0.73, 0.80, 0.85], [0, 1, 1, 0]);
    const text2Y = useTransform(scrollYProgress, [0.68, 0.73], [20, 0]);

    const text3Opacity = useTransform(scrollYProgress, [0.88, 0.92, 0.96, 1.0], [0, 1, 1, 0]);
    const text3Y = useTransform(scrollYProgress, [0.88, 0.92], [20, 0]);

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

            {/* Bloques de Texto Dinámicos */}
            <div className="absolute inset-0 flex items-center justify-center px-6">
                <div className="container max-w-4xl mx-auto text-center">
                    {/* Segmento 1 */}
                    <motion.div
                        style={{ opacity: text1Opacity, y: text1Y }}
                        className="absolute inset-0 flex items-center justify-center px-6"
                    >
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-2xl">
                            Tu negocio es excepcional; <br className="hidden md:block" />
                            tu presencia online también debe serlo.
                        </h2>
                    </motion.div>

                    {/* Segmento 2 */}
                    <motion.div
                        style={{ opacity: text2Opacity, y: text2Y }}
                        className="absolute inset-0 flex items-center justify-center px-6"
                    >
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-2xl">
                            Diseñamos ecosistemas web dinámicos y premium <br className="hidden md:block" />
                            que te posicionan como el líder de tu sector.
                        </h2>
                    </motion.div>

                    {/* Segmento 3 */}
                    <motion.div
                        style={{ opacity: text3Opacity, y: text3Y }}
                        className="absolute inset-0 flex items-center justify-center px-6"
                    >
                        <div className="flex flex-col items-center gap-6">
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-2xl">
                                La visibilidad no se negocia. <br className="hidden md:block" />
                                Dale a tu industria el nivel digital que merece.
                            </h2>
                            <span className="text-xl md:text-3xl font-bold bg-white text-slate-950 px-8 py-3 rounded-2xl shadow-xl">
                                🚀 Diseña tu web en tiempo real ahora.
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Viñeta sutil interna */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] pointer-events-none" />
        </motion.div>
    );
}
