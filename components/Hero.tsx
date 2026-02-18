'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, TrendingUp, ChevronLeft, ChevronRight, Star, ShoppingBag, Layers, Share2, Users, Video, Search } from 'lucide-react';
import WavesBackground from './WavesBackground';

// ─── Paleta Digitrial ─────────────────────────────────────────────────────────
// Navy: #1A2B4C  |  Green: #2ED573  |  Purple: #6C5CE7  |  White: #FFFFFF

// ─── Contador animado ─────────────────────────────────────────────────────────
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
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target, duration]);
    return { count, ref };
}

// ─── Datos del grid de servicios ──────────────────────────────────────────────
const portfolioCards = [
    {
        title: 'Diseño Web',
        metric: 'UX/UI',
        tag: 'Premium',
        bg: 'from-[#0d1b33] to-[#1A2B4C]',
        accent: '#2ED573',
        Icon: Layers,
    },
    {
        title: 'Tienda Online',
        metric: 'Ventas',
        tag: 'E-Comm',
        bg: 'from-[#1A2B4C] to-[#2d1b6e]',
        accent: '#6C5CE7',
        Icon: ShoppingBag,
    },
    {
        title: 'Social Media',
        metric: '+300%',
        tag: 'Growth',
        bg: 'from-[#0d1b33] to-[#1A2B4C]',
        accent: '#2ED573',
        Icon: Share2,
    },
    {
        title: 'Talento Humano',
        metric: '100%',
        tag: 'SST',
        bg: 'from-[#1A2B4C] to-[#2d1b6e]',
        accent: '#6C5CE7',
        Icon: Users,
    },
    {
        title: 'Producción',
        metric: '4K Cinema',
        tag: 'Media',
        bg: 'from-[#0d1b33] to-[#1A2B4C]',
        accent: '#2ED573',
        Icon: Video,
    },
    {
        title: 'SEO & Google',
        metric: 'Ranking #1',
        tag: 'Traffic',
        bg: 'from-[#1A2B4C] to-[#2d1b6e]',
        accent: '#6C5CE7',
        Icon: Search,
    },
];

// ─── Variantes de animación ───────────────────────────────────────────────────
const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.13 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 28, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.65, ease: 'easeOut' as const } },
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Hero() {
    const { count, ref: counterRef } = useCounter(135);

    return (
        <section className="pt-28 pb-20 px-6 lg:pt-36 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 50%, #f4f6f9 100%)' }}>

            {/* Blobs decorativos de fondo */}
            <motion.div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full -z-10 opacity-20"
                style={{ background: 'radial-gradient(circle, #6C5CE7 0%, transparent 70%)' }}
                animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full -z-10 opacity-15"
                style={{ background: 'radial-gradient(circle, #2ED573 0%, transparent 70%)' }}
                animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />

            {/* Ondas de agua sutiles animadas */}
            <WavesBackground />

            <div className="container mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                {/* ── COLUMNA IZQUIERDA ─────────────────────────────────── */}
                <motion.div variants={containerVariants} initial="hidden" animate="visible">

                    {/* Badge */}
                    <motion.div variants={itemVariants}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-7 border"
                        style={{ background: 'rgba(26,43,76,0.07)', color: '#1A2B4C', borderColor: 'rgba(26,43,76,0.15)' }}>
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#2ED573' }} />
                        Innovación Digital en Colombia
                    </motion.div>

                    {/* H1 */}
                    <motion.h1 variants={itemVariants}
                        className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] mb-5 tracking-tight"
                        style={{ color: '#1A2B4C' }}>
                        Impulsamos tu{' '}
                        <span className="block" style={{
                            background: 'linear-gradient(90deg, #1A2B4C 0%, #6C5CE7 60%, #a78bfa 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            Visión Digital
                        </span>
                    </motion.h1>

                    {/* Descripción */}
                    <motion.p variants={itemVariants}
                        className="text-lg md:text-xl mb-9 max-w-md leading-relaxed"
                        style={{ color: '#666666' }}>
                        Somos el Centro de Soluciones que transforma desafíos complejos en
                        oportunidades de crecimiento medibles a través de tecnología y estrategia.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-12">
                        {/* Botón principal */}
                        <a href="#services"
                            className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                            style={{ background: '#1A2B4C' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #1A2B4C, #6C5CE7)')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#1A2B4C')}>
                            Explorar Servicios <ArrowRight className="w-5 h-5" />
                        </a>

                        {/* Botón WhatsApp */}
                        <a href="https://wa.me/573123299053" target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold border-2 bg-white hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-lg"
                            style={{ borderColor: '#1A2B4C', color: '#1A2B4C' }}>
                            <svg className="w-5 h-5" fill="#2ED573" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                            </svg>
                            WhatsApp
                        </a>
                    </motion.div>

                    {/* Tarjeta de estadística flotante */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: [0, -6, 0], scale: 1 }}
                        transition={{
                            opacity: { duration: 0.5, delay: 0.8 },
                            scale: { duration: 0.5, delay: 0.8 },
                            y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 },
                        }}
                        className="inline-flex items-center gap-5 bg-white rounded-2xl px-6 py-5 shadow-2xl border"
                        style={{ borderColor: 'rgba(46,213,115,0.2)' }}>
                        {/* Icono */}
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                            style={{ background: 'linear-gradient(135deg, rgba(46,213,115,0.15), rgba(46,213,115,0.05))', border: '1.5px solid rgba(46,213,115,0.3)' }}>
                            <TrendingUp className="w-7 h-7" style={{ color: '#2ED573' }} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#999' }}>Crecimiento Real</p>
                            <p className="text-4xl font-extrabold leading-none" style={{ color: '#2ED573' }}>
                                +<span ref={counterRef}>{count}</span>%
                            </p>
                            <p className="text-sm font-bold uppercase tracking-widest mt-1" style={{ color: '#1A2B4C' }}>Confianza Total</p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* ── COLUMNA DERECHA — Grid 3x2 de tarjetas ─────────── */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}>

                    {portfolioCards.map((card, i) => (
                        <motion.div
                            key={i}
                            className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:shadow-xl"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}>

                            {/* Decoración de fondo sutil */}
                            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.03]"
                                style={{ background: `radial-gradient(circle, ${card.accent}, transparent)`, transform: 'translate(30%, -30%)' }} />

                            <div className="flex flex-col h-full justify-between gap-4">
                                {/* Header: Icono y Tag */}
                                <div className="flex items-start justify-between">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
                                        style={{ background: `${card.accent}15`, color: card.accent }}>
                                        <card.Icon className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                                        style={{ background: '#f1f5f9', color: '#64748b' }}>
                                        {card.tag}
                                    </span>
                                </div>

                                {/* Contenido: Título y Métrica */}
                                <div>
                                    <h3 className="text-base font-bold leading-tight mb-2 group-hover:text-blue-600 transition-colors"
                                        style={{ color: '#1A2B4C' }}>
                                        {card.title}
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <Star className="w-3.5 h-3.5 fill-current" style={{ color: card.accent }} />
                                        <span className="text-sm font-bold" style={{ color: card.accent }}>{card.metric}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

