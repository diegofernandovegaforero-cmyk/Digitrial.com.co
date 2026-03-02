'use client';
import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { Search, Sparkles, Globe, Server } from 'lucide-react';
import WavesBackground from './WavesBackground';

// ─── Paleta Digitrial ─────────────────────────────────────────────────────────
// Navy: #1A2B4C  |  Green: #2ED573  |  Purple: #6C5CE7  |  White: #FFFFFF

// ─── Variantes de animación ───────────────────────────────────────────────────
const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
};
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(5px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: 'easeOut' } },
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Hero() {
    const [domainQuery, setDomainQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (domainQuery.trim()) {
            // Ejemplo de acción al buscar (redirección a página de compra o consulta externa)
            window.open(`https://my.domain.com/search?q=${encodeURIComponent(domainQuery)}`, '_blank');
        }
    };

    return (
        <section className="pt-32 pb-24 px-6 lg:pt-40 relative overflow-hidden min-h-screen flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 50%, #fcfdfe 100%)' }}>

            {/* Blobs decorativos de fondo */}
            <motion.div className="absolute top-0 right-10 w-[600px] h-[600px] rounded-full -z-10 opacity-20 blur-3xl"
                style={{ background: 'radial-gradient(circle, #6C5CE7 0%, transparent 60%)' }}
                animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.div className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full -z-10 opacity-20 blur-3xl"
                style={{ background: 'radial-gradient(circle, #2ED573 0%, transparent 60%)' }}
                animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />

            {/* Ondas sutiles animadas */}
            <WavesBackground />

            <div className="container mx-auto max-w-5xl relative z-10">

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center text-center"
                >
                    {/* Badge */}
                    <motion.div variants={itemVariants}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest mb-8 shadow-sm transition-all hover:shadow-md"
                        style={{ background: 'rgba(46,213,115,0.1)', color: '#10b981', border: '1px solid rgba(46,213,115,0.2)' }}>
                        <Sparkles className="w-4 h-4" />
                        La plataforma de IA líder en creación web
                    </motion.div>

                    {/* Titular Principal */}
                    <motion.h1 variants={itemVariants}
                        className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.15] mb-6 tracking-tight text-[#1A2B4C] dark:text-white">
                        Olvida programar. <br className="hidden md:block" />
                        Construye tu éxito de forma{' '}
                        <span className="relative inline-block">
                            <span style={{
                                background: 'linear-gradient(90deg, #6C5CE7 0%, #9f32ac 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>
                                brillante.
                            </span>
                            <motion.span
                                className="absolute -bottom-2 left-0 w-full h-[6px] rounded-full"
                                style={{ background: 'linear-gradient(90deg, #6C5CE7 0%, #2ED573 100%)', opacity: 0.4 }}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 1, duration: 1 }}
                            />
                        </span>
                    </motion.h1>

                    {/* Subtítulos */}
                    <motion.p variants={itemVariants}
                        className="text-xl md:text-2xl font-bold mb-4 text-[#1A2B4C] dark:text-slate-200">
                        ¿No tienes experiencia técnica? No hay problema.
                    </motion.p>

                    <motion.p variants={itemVariants}
                        className="text-lg md:text-xl mb-12 max-w-3xl leading-relaxed text-[#666666] dark:text-slate-400">
                        Diseña, optimiza y publica una web profesional totalmente a tu medida en segundos. Digitrial toma tus ideas y las transforma en una realidad digital potente impulsada por Inteligencia Artificial.
                    </motion.p>

                    {/* CTA Principal */}
                    <motion.div variants={itemVariants} className="mb-16">
                        <Link href="/disena-tu-pagina"
                            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-extrabold text-white text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, #1A2B4C, #2ED573)' }}>
                            <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
                            <Sparkles className="w-6 h-6 animate-pulse" />
                            <span className="relative z-10">INICIA TU DISEÑO CON IA GRATIS</span>
                        </Link>
                        <p className="mt-4 text-sm font-semibold text-slate-500">Sin tarjeta de crédito. Resultados al instante.</p>
                    </motion.div>

                    {/* Buscador de Dominios */}
                    <motion.div variants={itemVariants}
                        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative z-20">

                        <div className="absolute -top-4 -right-4 bg-[#2ED573] text-[#1A2B4C] text-xs font-black uppercase px-4 py-1.5 rounded-full shadow-lg transform rotate-3">
                            ¡Asegura tu marca!
                        </div>

                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-4">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                                <input
                                    type="text"
                                    value={domainQuery}
                                    onChange={(e) => setDomainQuery(e.target.value)}
                                    placeholder="Encuentra el nombre perfecto para tu idea (ej. miempresa.com)"
                                    className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-[#6C5CE7] outline-none transition-all text-lg font-medium text-slate-700 placeholder-slate-400"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full md:w-auto px-10 py-5 rounded-2xl font-bold text-white text-lg hover:-translate-y-1 transition-transform shadow-lg whitespace-nowrap"
                                style={{ backgroundColor: '#1A2B4C' }}>
                                Buscar Dominios
                            </button>
                        </form>

                        {/* Explicación de Dominio y Hosting Integrado */}
                        <div className="mt-8 grid md:grid-cols-2 gap-6 text-left border-t border-slate-100 pt-6">
                            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#1A2B4C] mb-1">¿Qué es un Dominio?</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Es el nombre único de tu negocio en internet (como <strong>digitrial.com.co</strong>). Es lo que escriben tus clientes para encontrarte fácilmente. ¡Elige uno memorable!
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                    <Server className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#1A2B4C] mb-1">Tu diseño alojado seguro</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Una vez creado tu diseño con IA, nosotros lo guardamos en un <strong>Hosting</strong> de alto rendimiento: el "terreno" donde vive tu web, manteniéndola conectada, veloz y segura 24/7.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </motion.div>

            </div>
        </section>
    );
}

