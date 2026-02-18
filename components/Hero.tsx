'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';

// Animated counter hook
function useCounter(target: number, duration: number = 1500) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target, duration]);

    return { count, ref };
}

// Stagger container variants
const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.7, ease: 'easeOut' as const },
    },
};

export default function Hero() {
    const { count, ref: counterRef } = useCounter(127);

    return (
        <section className="pt-32 pb-20 px-6 lg:pt-40 bg-gradient-to-b from-white/85 to-blue-50/20 relative overflow-hidden">
            {/* Animated background blobs */}
            <motion.div
                className="absolute -top-32 -right-32 w-96 h-96 bg-blue-100 rounded-full blur-3xl -z-10"
                animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-100 rounded-full blur-3xl -z-10"
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />

            <div className="container mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Text Content */}
                <motion.div
                    className="order-2 lg:order-1"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-8 border border-blue-100"
                    >
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        Innovación Digital en Colombia
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 text-slate-900 tracking-tight"
                    >
                        Impulsamos tu <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x">
                            Visión Digital
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-gray-500 text-lg md:text-xl mb-10 max-w-lg leading-relaxed"
                    >
                        Somos el Centro de Soluciones que transforma desafíos complejos en
                        oportunidades de crecimiento medibles a través de tecnología y estrategia.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                        <a
                            href="#services"
                            className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            Explorar Servicios <ArrowRight className="w-5 h-5" />
                        </a>
                        <a
                            href="https://wa.me/573123299053"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group border border-gray-200 bg-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-50 hover:border-green-200 transition-all duration-300"
                        >
                            <svg className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                            WhatsApp
                        </a>
                    </motion.div>
                </motion.div>

                {/* Video Content */}
                <motion.div
                    className="order-1 lg:order-2 relative"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-all duration-500">
                        {/* Video Background */}
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-auto object-cover"
                            style={{ minHeight: '400px' }}
                        >
                            <source src="/videos/background-watermark.mp4.mp4" type="video/mp4" />
                        </video>

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                    </div>

                    {/* Floating Stat Card — animated counter + levitation */}
                    <motion.div
                        className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-50 flex items-center gap-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: [0, -8, 0],
                        }}
                        transition={{
                            opacity: { duration: 0.5, delay: 0.8 },
                            scale: { duration: 0.5, delay: 0.8 },
                            y: {
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: 1.2,
                            },
                        }}
                    >
                        <div className="bg-green-100 p-4 rounded-xl text-green-600">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Crecimiento</p>
                            <p className="text-3xl font-extrabold text-slate-900">
                                +<span ref={counterRef}>{count}</span>%
                            </p>
                        </div>
                    </motion.div>

                    {/* Decorative blobs */}
                    <motion.div
                        className="absolute -top-10 -right-10 w-24 h-24 bg-blue-100 rounded-full blur-2xl -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    />
                    <motion.div
                        className="absolute top-1/2 -left-10 w-32 h-32 bg-purple-100 rounded-full blur-3xl -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    />
                </motion.div>
            </div>
        </section>
    );
}
