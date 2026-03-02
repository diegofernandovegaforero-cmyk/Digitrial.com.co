'use client';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart, Users, Layout, Smartphone, Code } from 'lucide-react';
import WavesBackground from './WavesBackground';

const templates = [
    {
        title: "Gastronomía: LaBurguer",
        description: "Diseño audaz y apetecible para restaurantes de comida rápida gourmet que buscan impacto visual.",
        icon: <ShoppingCart className="w-6 h-6" />,
        image: "/images/templates/laburguer.png",
        color: "bg-red-50 text-red-600"
    },
    {
        title: "Cortes Premium: Yanapore",
        description: "Elegancia y sofisticación para parrillas y restaurantes de alta cocina con enfoque en la tradición.",
        icon: <Users className="w-6 h-6" />,
        image: "/images/templates/yanapore.png",
        color: "bg-amber-50 text-amber-600"
    },
    {
        title: "Tradición: MasaViva",
        description: "Un tributo a lo artesanal con un toque moderno para panaderías y negocios de comida típica.",
        icon: <Layout className="w-6 h-6" />,
        image: "/images/templates/masaviva.png",
        color: "bg-orange-50 text-orange-600"
    },
    {
        title: "Fitness: Big Fit",
        description: "Energía pura y potencia para gimnasios, suplementos y equipamiento deportivo profesional.",
        icon: <Smartphone className="w-6 h-6" />,
        image: "/images/templates/bigfit.png",
        color: "bg-orange-50 text-orange-600"
    },
    {
        title: "Automotriz: SuccessCar",
        description: "Confianza y robustez para repuestos, talleres y servicios de mantenimiento vehicular.",
        icon: <Code className="w-6 h-6" />,
        image: "/images/templates/successcar.png",
        color: "bg-blue-50 text-blue-600"
    }
];

export default function Templates() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const headerRef = useRef<HTMLDivElement>(null);
    const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 500 : -500,
            opacity: 0,
            scale: 0.9,
            filter: 'blur(10px)'
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)'
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 500 : -500,
            opacity: 0,
            scale: 0.9,
            filter: 'blur(10px)'
        })
    };

    const nextSlide = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % templates.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + templates.length) % templates.length);
    };

    // Auto-play
    useEffect(() => {
        const timer = setInterval(nextSlide, 6000);
        return () => clearInterval(timer);
    }, [currentIndex]);

    return (
        <section id="templates" className="py-24 bg-transparent relative overflow-hidden">
            <WavesBackground />
            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    ref={headerRef}
                    className="text-center mb-20 px-6"
                    initial={{ opacity: 0, y: 30 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] tracking-tight font-[family-name:var(--font-outfit)]">
                        Plantillas generadas con IA
                    </h2>
                </motion.div>

                <div className="relative max-w-5xl mx-auto h-[500px] flex items-center justify-center">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.5 }
                            }}
                            className="absolute w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 flex flex-col md:flex-row h-full"
                        >
                            {/* Imagen del Template */}
                            <div className="relative w-full md:w-3/5 h-64 md:h-auto overflow-hidden">
                                <Image
                                    src={templates[currentIndex].image}
                                    alt={templates[currentIndex].title}
                                    fill
                                    className="object-cover transition-transform duration-700 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                                <div className={`absolute top-6 right-6 w-14 h-14 ${templates[currentIndex].color} bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg z-10`}>
                                    {templates[currentIndex].icon}
                                </div>
                            </div>

                            {/* Contenido del Template */}
                            <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-center">
                                <motion.h3
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-2xl md:text-3xl font-black mb-4 text-slate-900 dark:text-white uppercase tracking-tighter"
                                >
                                    {templates[currentIndex].title}
                                </motion.h3>
                                <motion.p
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-0"
                                >
                                    {templates[currentIndex].description}
                                </motion.p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Controles de Navegación */}
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
                        <button
                            onClick={prevSlide}
                            className="p-4 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all active:scale-95 border border-slate-100 dark:border-slate-700"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <div className="flex gap-2">
                            {templates.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setDirection(i > currentIndex ? 1 : -1);
                                        setCurrentIndex(i);
                                    }}
                                    className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? "w-8 bg-blue-600" : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={nextSlide}
                            className="p-4 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all active:scale-95 border border-slate-100 dark:border-slate-700"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
