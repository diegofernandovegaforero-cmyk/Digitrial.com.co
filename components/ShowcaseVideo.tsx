'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const categories = [
    "GASTRONOMÍA",
    "FITNESS & SALUD",
    "AUTOMOTRIZ",
    "REPOSTERÍA",
    "MODA & ESTILO",
    "BIENES RAÍCES"
];

export default function ShowcaseVideo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Animaciones basadas en el progreso del scroll
    const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);
    const borderRadius = useTransform(scrollYProgress, [0, 0.5], ["4rem", "0rem"]);
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    return (
        <section ref={containerRef} className="relative h-[150vh] bg-slate-900 overflow-hidden">
            <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
                <motion.div
                    style={{
                        scale,
                        opacity,
                        borderRadius,
                        width: '100%',
                        height: '100%'
                    }}
                    className="relative w-full h-full overflow-hidden bg-blue-600"
                >
                    {/* Video de fondo - Alta calidad futurista */}
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover scale-110"
                    >
                        <source src="https://assets.mixkit.co/videos/preview/mixkit-futuristic-business-environment-with-holograms-34538-large.mp4" type="video/mp4" />
                        Tu navegador no soporta el elemento de video.
                    </video>

                    {/* Superposición de Gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-900/60" />

                    {/* Contenido de Texto */}
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl"
                        >
                            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold tracking-[0.2em] uppercase mb-6 backdrop-blur-sm border border-blue-500/30">
                                Casos de Éxito Digital
                            </span>
                            <h2 className="text-4xl md:text-7xl font-extrabold text-white mb-8 tracking-tighter leading-none">
                                DE LA IDEA A LA <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 italic">REALIDAD</span>
                            </h2>
                            <p className="text-xl md:text-2xl text-slate-300 font-medium max-w-2xl mx-auto mb-12">
                                Diferentes sectores, una misma decisión: <br />
                                <span className="text-white font-bold">Crecer con DIGITRIAL.</span>
                            </p>

                            {/* Scrolling Categories */}
                            <div className="flex flex-wrap justify-center gap-4 opacity-70">
                                {categories.map((cat, i) => (
                                    <motion.div
                                        key={cat}
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="text-xs md:text-sm font-bold text-blue-300 border border-blue-300/20 px-4 py-2 rounded-xl backdrop-blur-md"
                                    >
                                        {cat}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Floating Logos/Elements Simulation */}
                    <motion.div
                        style={{ y }}
                        className="absolute bottom-20 right-10 md:right-20 z-20"
                    >
                        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-white rounded-full" />
                                </div>
                                <div>
                                    <div className="w-24 h-2 bg-white/20 rounded-full mb-2" />
                                    <div className="w-16 h-2 bg-white/10 rounded-full" />
                                </div>
                            </div>
                            <div className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">
                                Logo Generado por IA
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
