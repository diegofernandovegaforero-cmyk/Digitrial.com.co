'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, TrendingUp, ChevronLeft, ChevronRight, Star } from 'lucide-react';

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

// ─── Datos del carrusel de portafolio ─────────────────────────────────────────
const portfolioCards = [
    {
        title: 'Tienda Online XYZ',
        metric: '98% Satisfacción',
        tag: 'E-Commerce',
        bg: 'from-[#1A2B4C] to-[#0d1b33]',
        accent: '#2ED573',
        icon: '🛒',
        desc: 'Plataforma de ventas con integración de pagos y logística automatizada.',
    },
    {
        title: 'Plataforma DEF',
        metric: 'Crecimiento +250%',
        tag: 'SaaS',
        bg: 'from-[#1A2B4C] to-[#2d1b6e]',
        accent: '#6C5CE7',
        icon: '📊',
        desc: 'Dashboard analítico con reportes en tiempo real para equipos de ventas.',
    },
    {
        title: 'Funnel Estratégico',
        metric: 'ROI +180%',
        tag: 'Marketing',
        bg: 'from-[#0d1b33] to-[#1A2B4C]',
        accent: '#2ED573',
        icon: '🎯',
        desc: 'Embudo de conversión automatizado con seguimiento de leads 24/7.',
    },
    {
        title: 'Landing Premium',
        metric: 'Conversión +320%',
        tag: 'Landing Page',
        bg: 'from-[#2d1b6e] to-[#1A2B4C]',
        accent: '#6C5CE7',
        icon: '🚀',
        desc: 'Página de alta conversión con A/B testing y optimización continua.',
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
    const [activeCard, setActiveCard] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-play del carrusel
    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(() => {
            setActiveCard(prev => (prev + 1) % portfolioCards.length);
        }, 3200);
        return () => clearInterval(timer);
    }, [isAutoPlaying]);

    function prev() {
        setIsAutoPlaying(false);
        setActiveCard(p => (p - 1 + portfolioCards.length) % portfolioCards.length);
    }
    function next() {
        setIsAutoPlaying(false);
        setActiveCard(p => (p + 1) % portfolioCards.length);
    }

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
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: '#1A2B4C' }}>Confianza Comprobada</p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* ── COLUMNA DERECHA — Carrusel de portafolio ─────────── */}
                <motion.div
                    className="relative"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}>

                    {/* Tarjeta principal activa */}
                    <div className="relative" style={{ perspective: '1000px' }}>
                        {portfolioCards.map((card, i) => (
                            <motion.div
                                key={i}
                                className={`rounded-3xl overflow-hidden shadow-2xl border border-white/10 ${i === activeCard ? 'block' : 'hidden'}`}
                                initial={{ opacity: 0, rotateY: -8, scale: 0.96 }}
                                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                style={{ transformStyle: 'preserve-3d' }}>

                                {/* Fondo degradado oscuro */}
                                <div className={`bg-gradient-to-br ${card.bg} p-8 min-h-[360px] flex flex-col justify-between relative overflow-hidden`}>

                                    {/* Decoración de fondo */}
                                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
                                        style={{ background: `radial-gradient(circle, ${card.accent}, transparent)`, transform: 'translate(30%, -30%)' }} />
                                    <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
                                        style={{ background: `radial-gradient(circle, ${card.accent}, transparent)`, transform: 'translate(-30%, 30%)' }} />

                                    {/* Header de la tarjeta */}
                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-6">
                                            <span className="text-5xl">{card.icon}</span>
                                            <span className="px-3 py-1 rounded-full text-xs font-bold"
                                                style={{ background: `${card.accent}22`, color: card.accent, border: `1px solid ${card.accent}44` }}>
                                                {card.tag}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-extrabold text-white mb-2">{card.title}</h3>
                                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{card.desc}</p>
                                    </div>

                                    {/* Métrica destacada */}
                                    <div className="relative z-10 mt-6">
                                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/10">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, s) => (
                                                    <Star key={s} className="w-3.5 h-3.5 fill-current" style={{ color: card.accent }} />
                                                ))}
                                            </div>
                                            <span className="text-xl font-extrabold" style={{ color: card.accent }}>{card.metric}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Controles del carrusel */}
                    <div className="flex items-center justify-between mt-5 px-1">
                        {/* Dots */}
                        <div className="flex gap-2">
                            {portfolioCards.map((_, i) => (
                                <button key={i}
                                    onClick={() => { setIsAutoPlaying(false); setActiveCard(i); }}
                                    className="rounded-full transition-all duration-300"
                                    style={{
                                        width: i === activeCard ? '24px' : '8px',
                                        height: '8px',
                                        background: i === activeCard ? '#1A2B4C' : 'rgba(26,43,76,0.25)',
                                    }}
                                    aria-label={`Ir a tarjeta ${i + 1}`}
                                />
                            ))}
                        </div>

                        {/* Flechas */}
                        <div className="flex gap-2">
                            <button onClick={prev}
                                className="w-10 h-10 rounded-full flex items-center justify-center border-2 hover:-translate-y-0.5 transition-all duration-200 shadow-md"
                                style={{ borderColor: '#1A2B4C', color: '#1A2B4C', background: 'white' }}
                                aria-label="Anterior">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={next}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:-translate-y-0.5 transition-all duration-200 shadow-md"
                                style={{ background: '#1A2B4C' }}
                                aria-label="Siguiente">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Tarjetas apiladas detrás (efecto profundidad) */}
                    <div className="absolute -bottom-3 -right-3 w-full h-full rounded-3xl -z-10 opacity-30"
                        style={{ background: 'linear-gradient(135deg, #6C5CE7, #1A2B4C)', transform: 'rotate(2deg)' }} />
                    <div className="absolute -bottom-6 -right-6 w-full h-full rounded-3xl -z-20 opacity-15"
                        style={{ background: 'linear-gradient(135deg, #2ED573, #1A2B4C)', transform: 'rotate(4deg)' }} />
                </motion.div>
            </div>
        </section>
    );
}
