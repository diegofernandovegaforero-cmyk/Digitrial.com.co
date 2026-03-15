'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, X, Rocket, CheckCircle2, Star, Zap } from 'lucide-react';

export default function PlanesDigitrial() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            {/* TAB DOCKED EN FONDO — siempre visible, no interfiere con el preview */}
            <AnimatePresence>
                {!isExpanded && (
                    <motion.div
                        initial={{ y: 80 }}
                        animate={{ y: 0 }}
                        exit={{ y: 80 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 200 }}
                        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
                    >
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="w-full rounded-t-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 shadow-[0_-6px_40px_rgba(99,102,241,0.55)] flex flex-col items-center justify-center pt-2 pb-4 gap-1 transition-all hover:brightness-110 group"
                        >
                            {/* Handle visual */}
                            <div className="w-10 h-1 rounded-full bg-white/40 mb-1 group-hover:bg-white/70 transition-colors" />
                            <div className="flex items-center gap-2 text-white font-extrabold text-sm tracking-wide">
                                <Rocket className="w-4 h-4 animate-pulse" />
                                <span>Hacer realidad este diseño</span>
                                <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                            <p className="text-white/60 text-[11px]">Planes desde $299.000 · Ver opciones</p>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ESTADO EXPANDIDO: Bottom Sheet */}
            <AnimatePresence>
                {isExpanded && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsExpanded(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
                        />

                        {/* Bottom Sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 w-full z-[70] bg-slate-900/95 backdrop-blur-xl border-t-2 border-blue-500/40 shadow-[0_-20px_80px_rgba(99,102,241,0.3)] rounded-t-3xl max-h-[90vh] overflow-y-auto"
                        >
                            {/* Handle visible */}
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-12 h-1.5 rounded-full bg-white/20" />
                            </div>

                            {/* Close */}
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="absolute top-4 right-5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="max-w-6xl mx-auto px-5 md:px-10 pb-10">
                                {/* Header */}
                                <div className="text-center mb-8 mt-4">
                                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1 mb-3">
                                        <Zap className="w-3.5 h-3.5 text-blue-400" />
                                        <span className="text-blue-300 text-xs font-semibold uppercase tracking-wider">Tu diseño está listo</span>
                                    </div>
                                    <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2">
                                        Elige cómo lo lanzamos a internet
                                    </h2>
                                    <p className="text-slate-400 text-sm md:text-base">
                                        Publicamos tu diseño con dominio y hosting profesional
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-4">

                                    {/* PAQUETE 1: Despegue */}
                                    <div className="bg-slate-800/80 rounded-2xl p-6 md:p-7 flex flex-col h-full border border-slate-700 hover:border-slate-500 transition-colors">
                                        <h3 className="text-xl font-bold text-white mb-3">Despegue</h3>
                                        <p className="text-sm text-slate-400 mb-5 min-h-[52px]">
                                            El código HTML exacto generado por la IA. Nosotros lo subimos a internet tal cual lo diseñaste.
                                        </p>
                                        <ul className="space-y-2.5 mb-7 flex-1">
                                            {['Hosting básico (1 año)', 'Dominio .com o .co', 'Diseño generado por IA'].map(item => (
                                                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <a
                                            href="https://wa.me/573123299053?text=Quiero%20el%20plan%20Despegue"
                                            target="_blank"
                                            className="group relative w-full px-6 py-3.5 rounded-xl font-extrabold text-white text-center shadow-lg transition-all duration-300 overflow-hidden bg-slate-700 hover:bg-slate-600 block"
                                        >
                                            <div className="absolute inset-0 w-full h-full bg-white/10 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
                                            <span className="relative z-10">Elegir Despegue</span>
                                        </a>
                                    </div>

                                    {/* PAQUETE 2: Llave en Mano (DESTACADO) */}
                                    <div className="bg-gradient-to-b from-blue-900/50 to-slate-900 rounded-2xl p-6 md:p-7 flex flex-col h-full border-2 border-blue-500 relative md:-translate-y-4 shadow-[0_0_50px_rgba(59,130,246,0.25)]">
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-violet-500 text-white text-xs font-bold py-1 px-4 rounded-full flex items-center gap-1 shadow-lg whitespace-nowrap">
                                            <Star className="w-3.5 h-3.5 fill-white" /> El Más Vendido
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3 mt-2">Llave en Mano</h3>
                                        <p className="text-sm text-blue-200/80 mb-5 min-h-[52px]">
                                            Tomamos tu diseño, lo perfeccionamos con expertos y te entregamos una web lista para recibir clientes.
                                        </p>
                                        <ul className="space-y-2.5 mb-7 flex-1">
                                            {[
                                                'Hosting rápido y Dominio (1 año)',
                                                'Pulido humano y ajuste corporativo',
                                                'Botón WhatsApp y Formulario funcional',
                                                'Optimización móvil',
                                                'SEO Básico en Google',
                                            ].map(item => (
                                                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-200">
                                                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <a
                                            href="https://wa.me/573123299053?text=Quiero%20el%20plan%20Llave%20en%20Mano"
                                            target="_blank"
                                            className="group relative w-full px-6 py-3.5 rounded-xl font-extrabold text-white text-center shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-blue-500/30 block"
                                        >
                                            <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
                                            <span className="relative z-10">Quiero mi web lista</span>
                                        </a>
                                    </div>

                                    {/* PAQUETE 3: Máquina de Ventas */}
                                    <div className="bg-slate-800/80 rounded-2xl p-6 md:p-7 flex flex-col h-full border border-slate-700 hover:border-purple-500/60 transition-colors group">
                                        <h3 className="text-xl font-bold text-white mb-3">Máquina de Ventas</h3>
                                        <p className="text-sm text-slate-400 mb-5 min-h-[52px] group-hover:text-purple-200/70 transition-colors">
                                            Para negocios que no solo quieren presencia, sino transacciones y escalabilidad.
                                        </p>
                                        <ul className="space-y-2.5 mb-5 flex-1">
                                            {[
                                                'Todo lo de Llave en Mano',
                                                'Integración Wompi / MercadoPago',
                                                'Catálogo Autoadministrable (CMS)',
                                                'Analytics y Píxel de Meta',
                                            ].map(item => (
                                                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                                                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="bg-purple-900/30 text-purple-200 text-xs p-3 rounded-xl mb-4 text-center border border-purple-500/20">
                                            <strong>NOTA:</strong> Para incluir Shopify, contáctate con un asesor especializado.
                                        </div>

                                        <a
                                            href="https://wa.me/573123299053?text=Quiero%20el%20plan%20Máquina%20de%20Ventas"
                                            target="_blank"
                                            className="group/btn relative w-full px-6 py-3.5 rounded-xl font-extrabold text-purple-400 border-2 border-purple-600 transition-all duration-300 overflow-hidden hover:bg-purple-600 hover:text-white text-center block"
                                        >
                                            <div className="absolute inset-0 w-full h-full bg-white/10 group-hover/btn:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
                                            <span className="relative z-10">Elegir Premium</span>
                                        </a>
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
