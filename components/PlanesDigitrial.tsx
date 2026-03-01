'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, CheckCircle2, Star } from 'lucide-react';

export default function PlanesDigitrial() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            {/* ESTADO MINIMIZADO: Botón Flotante */}
            <AnimatePresence>
                {!isExpanded && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setIsExpanded(true)}
                        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-[0_10px_40px_rgba(37,99,235,0.4)] flex items-center gap-2 transition-transform hover:scale-105"
                    >
                        <Rocket className="w-5 h-5" />
                        <span>Hacer realidad este diseño</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ESTADO EXPANDIDO: Bottom Sheet */}
            <AnimatePresence>
                {isExpanded && (
                    <>
                        {/* Overlay Oscuro para enfoque */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsExpanded(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />

                        {/* Contenedor Principal */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 w-full z-[70] bg-slate-900/90 backdrop-blur-xl border-t border-slate-700/50 shadow-2xl rounded-t-3xl p-6 md:p-10 max-h-[90vh] overflow-y-auto"
                        >
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="max-w-6xl mx-auto">
                                <div className="text-center mb-10 mt-2">
                                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                                        ¡Tu diseño está listo!
                                    </h2>
                                    <p className="text-slate-400 text-lg">
                                        Elige cómo lo lanzamos a internet
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 items-start pb-8">

                                    {/* PAQUETE 1: Despegue */}
                                    <div className="bg-slate-800 rounded-2xl p-6 md:p-8 flex flex-col h-full border border-slate-700">
                                        <h3 className="text-2xl font-bold text-white mb-4">Despegue</h3>
                                        <p className="text-sm text-slate-400 mb-6 min-h-[60px]">
                                            El código HTML exacto generado por la IA. Nosotros lo subimos a internet tal cual lo diseñaste.
                                        </p>
                                        <ul className="space-y-3 mb-8 flex-1">
                                            <li className="flex items-start gap-3 text-sm text-slate-300">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                                <span>Hosting básico (1 año)</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-slate-300">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                                <span>Dominio .com o .co</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-slate-300">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                                <span>Diseño generado por IA</span>
                                            </li>
                                        </ul>
                                        <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3.5 rounded-xl transition-colors">
                                            Elegir Despegue
                                        </button>
                                    </div>

                                    {/* PAQUETE 2: Llave en Mano (DESTACADO) */}
                                    <div className="bg-gradient-to-b from-blue-900/40 to-slate-900 rounded-2xl p-6 md:p-8 flex flex-col h-full border-2 border-blue-500 relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(59,130,246,0.2)]">
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold py-1 px-4 rounded-full flex items-center gap-1 shadow-lg whitespace-nowrap">
                                            <Star className="w-3.5 h-3.5 fill-white" /> El Más Vendido
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-4 mt-2">Llave en Mano</h3>
                                        <p className="text-sm text-blue-200/80 mb-6 min-h-[60px]">
                                            Tomamos tu diseño, lo perfeccionamos con nuestro equipo de expertos y te entregamos una web lista para recibir clientes.
                                        </p>
                                        <ul className="space-y-3 mb-8 flex-1">
                                            <li className="flex items-start gap-3 text-sm text-slate-200">
                                                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                                                <span>Hosting rápido y Dominio (1 año)</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-slate-200">
                                                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                                                <span>Pulido humano y ajuste corporativo</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-slate-200">
                                                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                                                <span>Botón de WhatsApp y Formulario funcional</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-slate-200">
                                                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                                                <span>Optimización móvil</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-slate-200">
                                                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                                                <span>SEO Básico en Google</span>
                                            </li>
                                        </ul>
                                        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-500/25">
                                            Quiero mi web lista
                                        </button>
                                    </div>

                                    {/* PAQUETE 3: Máquina de Ventas */}
                                    <div className="bg-slate-800 hover:bg-slate-800/80 rounded-2xl p-6 md:p-8 flex flex-col h-full border border-slate-700 hover:border-purple-500/50 transition-colors group">
                                        <h3 className="text-2xl font-bold text-white mb-4">Máquina de Ventas</h3>
                                        <p className="text-sm text-slate-400 mb-6 min-h-[60px] group-hover:text-purple-200/70 transition-colors">
                                            Para negocios establecidos que no solo quieren presencia, sino transacciones y escalabilidad.
                                        </p>
                                        <ul className="space-y-3 mb-8 flex-1">
                                            <li className="flex items-start gap-3 text-sm text-slate-300">
                                                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                                                <span className="font-semibold">Todo lo de Llave en Mano</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-slate-300">
                                                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                                                <span>Integración Wompi / MercadoPago</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-slate-300">
                                                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                                                <span>Catálogo Autoadministrable (CMS)</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-slate-300">
                                                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                                                <span>Analytics y Píxel de Meta</span>
                                            </li>
                                        </ul>

                                        <div className="bg-purple-900/30 text-purple-200 text-xs p-3 rounded-xl mb-4 text-center border border-purple-500/20">
                                            <strong>NOTA:</strong> Para incluir Shopify en tu proyecto, contáctate con un asesor especializado.
                                        </div>

                                        <button className="w-full bg-transparent border-2 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white font-bold py-3 rounded-xl transition-colors">
                                            Elegir Premium
                                        </button>
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
