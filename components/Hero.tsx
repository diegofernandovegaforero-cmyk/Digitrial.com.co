'use client';
import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { Search, Sparkles, Globe, Server, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
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

export function HeroHeader() {
    return (
        <section className="pt-32 pb-16 lg:pt-40 relative overflow-hidden flex flex-col items-center justify-center bg-white z-20">
            {/* Blobs decorativos de fondo suavizados para fondo blanco */}
            <motion.div className="absolute top-0 right-10 w-[600px] h-[600px] rounded-full -z-10 opacity-10 blur-3xl"
                style={{ background: 'radial-gradient(circle, #6C5CE7 0%, transparent 60%)' }}
                animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.div className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full -z-10 opacity-10 blur-3xl"
                style={{ background: 'radial-gradient(circle, #2ED573 0%, transparent 60%)' }}
                animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />

            {/* Ondas sutiles animadas */}
            <WavesBackground />

            <div className="w-full relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center text-center"
                >
                    {/* Titular Principal con Efecto Video-Text (COMPILADOVIDEOS.mp4) - AHORA FULL WIDTH */}
                    <div className="relative overflow-hidden group w-full min-h-[300px] flex items-center justify-center">
                        {/* Video de fondo para las letras */}
                        <div className="absolute inset-0 z-0">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                            >
                                <source src="/videos/COMPILADOVIDEOS.mp4" type="video/mp4" />
                            </video>
                        </div>
                        
                        {/* Texto con blend mode para actuar como máscara */}
                        <motion.h1 
                            variants={itemVariants}
                            className="relative z-10 w-full text-5xl md:text-7xl lg:text-[10rem] font-black leading-[0.85] py-4 tracking-[-0.05em] text-black bg-white mix-blend-screen font-anton uppercase select-none"
                        >
                            <span className="block">CREA TU WEB</span>
                            <span className="block">EN MINUTOS.</span>
                        </motion.h1>
                    </div>

                    <div className="container mx-auto max-w-5xl px-6">
                        <motion.div variants={itemVariants} className="flex flex-col items-center mt-6">
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6 tracking-tight uppercase font-anton text-center">
                                Transforma tus ideas en una realidad{' '}
                                <span className="text-blue-600">digital potente.</span>
                            </h2>
                        </motion.div>

                        <motion.p variants={itemVariants}
                            className="text-lg md:text-xl mb-12 max-w-3xl leading-relaxed text-slate-600 text-center">
                            Creamos tu página web a medida, moderna y altamente funcional impulsada por IA.
                        </motion.p>

                        {/* CTA Principal */}
                        <motion.div variants={itemVariants} className="mb-0 flex flex-col items-center">
                            <p className="mb-4 text-sm font-bold text-blue-600 uppercase tracking-wider">
                                Rápido, sencillo y 100% profesional.
                            </p>
                            <Link href="/disena-tu-pagina"
                                className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-extrabold text-white text-lg shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 hover:shadow-blue-600/40 dark:hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 uppercase">
                                <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
                                <Sparkles className="w-6 h-6 animate-pulse" />
                                <span className="relative z-10">Lanzar mi web hoy</span>
                            </Link>
                            <p className="mt-4 text-sm font-semibold text-slate-500">Sin tarjeta de crédito. Resultados al instante.</p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// ─── Componente de Búsqueda de Dominios ───────────────────────────────────────
export function HeroSearch() {
    const [domainQuery, setDomainQuery] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [domainStatus, setDomainStatus] = useState<'IDLE' | 'AVAILABLE' | 'UNAVAILABLE' | 'ERROR'>('IDLE');
    const [statusMessage, setStatusMessage] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!domainQuery.trim()) return;

        setIsChecking(true);
        setDomainStatus('IDLE');
        setStatusMessage('');

        try {
            const res = await fetch(`/api/domain-check?domain=${encodeURIComponent(domainQuery.trim())}`);
            const data = await res.json();
            if (res.ok) {
                setDomainStatus(data.status);
                setStatusMessage(data.message || (data.status === 'AVAILABLE' ? '¡El dominio está disponible!' : 'Dominio ya registrado.'));
            } else {
                setDomainStatus('ERROR');
                setStatusMessage(data.error || 'Ocurrió un error al verificar el dominio.');
            }
        } catch (error) {
            setDomainStatus('ERROR');
            setStatusMessage('No se pudo conectar con el servidor.');
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <section className="pb-24 pt-8 px-6 relative z-40 flex flex-col items-center bg-white transition-colors duration-500">
            <div className="container mx-auto max-w-5xl">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex flex-col items-center text-center"
                >
                    <motion.div
                        variants={itemVariants}
                        className="w-full max-w-4xl relative mt-0 z-10"
                    >
                        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-slate-200 relative z-10 transition-all duration-300">
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                    rotate: [-1, 1, -1]
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-6 -right-6 bg-[#ADFF2F] text-black text-[10px] font-black px-4 py-2 rounded-xl shadow-lg border-2 border-white z-20 flex items-center gap-1"
                            >
                                <Sparkles className="w-3 h-3" />
                                DISEÑOS REALIZADOS CON I.A
                            </motion.div>

                            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-4 relative">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                                    <input
                                        type="text"
                                        value={domainQuery}
                                        onChange={(e) => {
                                            setDomainQuery(e.target.value);
                                            if (domainStatus !== 'IDLE') setDomainStatus('IDLE');
                                        }}
                                        placeholder="Encuentra el nombre perfecto para tu idea (ej. miempresa.com)"
                                        className={`w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-100 border-2 outline-none transition-all text-lg font-medium text-slate-900 placeholder-slate-400 ${domainStatus === 'AVAILABLE' ? 'border-green-400 bg-green-50/50' :
                                            domainStatus === 'UNAVAILABLE' || domainStatus === 'ERROR' ? 'border-red-400 bg-red-50/50' :
                                                'border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                                            }`}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isChecking}
                                    className="w-full md:w-auto px-10 py-5 rounded-2xl font-bold text-white text-lg hover:-translate-y-1 transition-transform shadow-lg whitespace-nowrap disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center min-w-[200px]"
                                    style={{ backgroundColor: '#1A2B4C' }}>
                                    {isChecking ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Buscar Dominios'}
                                </button>
                            </form>

                            {/* Mensaje de Resultado API */}
                            {domainStatus !== 'IDLE' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mt-4 p-4 rounded-xl flex items-center justify-between gap-3 text-left border ${domainStatus === 'AVAILABLE' ? 'bg-green-50 border-green-200 text-green-800' :
                                        'bg-red-50 border-red-200 text-red-800'
                                        }`}>
                                    <div className="flex items-center gap-3">
                                        {domainStatus === 'AVAILABLE' ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <XCircle className="w-6 h-6 text-red-600" />}
                                        <span className="font-semibold">{statusMessage}</span>
                                    </div>
                                    {domainStatus === 'AVAILABLE' && (
                                        <Link href="/disena-tu-pagina" className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors">
                                            ¡Reclámalo Ahora!
                                        </Link>
                                    )}
                                </motion.div>
                            )}

                            {/* Explicación de Dominio y Hosting Integrado en Modo Claro */}
                            <div className="mt-8 grid md:grid-cols-2 gap-6 text-left border-t border-slate-100 pt-6">
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                        <Globe className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1">¿Qué es un Dominio?</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            Es el nombre único de tu negocio en internet (como <strong>digitrial.com.co</strong>). Es lo que escriben tus clientes para encontrarte fácilmente. ¡Elige uno memorable!
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                        <Server className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1">Tu diseño alojado seguro</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            Una vez creado tu diseño con IA, nosotros lo guardamos en un <strong>Hosting</strong> de alto rendimiento: el "terreno" donde vive tu web, manteniéndola conectada, veloz y segura 24/7.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

export default function Hero() {
    return (
        <>
            <HeroHeader />
            <HeroSearch />
        </>
    );
}
