'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, CheckCircle2, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';

interface RecargaCreditosProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RecargaCreditos({ isOpen, onClose }: RecargaCreditosProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="fixed inset-0 m-auto w-full max-w-2xl h-fit z-[101] p-6"
                    >
                        <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] relative">
                            {/* Close */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors z-20"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-8 relative z-10">
                                {/* Header */}
                                <div className="text-center mb-10">
                                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4">
                                        <Zap className="w-4 h-4 text-blue-400" />
                                        <span className="text-blue-300 text-[10px] font-black uppercase tracking-[0.2em]">Recarga de Créditos</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-white mb-3 italic tracking-tight tracking-tight">¡No detengas tu creatividad!</h2>
                                    <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                                        Te has quedado sin intentos. Recarga ahora y sigue perfeccionando tu web con el poder de la IA.
                                    </p>
                                </div>

                                {/* Opciones */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                                    
                                    {/* OPCIÓN 1: Básica (Tema Despegue) */}
                                    <div className="group relative bg-slate-800/80 border border-slate-700 p-7 rounded-2xl hover:border-slate-500 transition-all flex flex-col items-center text-center backdrop-blur-md overflow-hidden">
                                        <div className="w-14 h-14 bg-slate-700/30 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                                            <Sparkles className="w-7 h-7 text-emerald-400" />
                                        </div>
                                        <h3 className="text-xl font-black text-white mb-1 tracking-tight">Recarga Básica</h3>
                                        <div className="text-3xl font-black text-white mb-6 flex items-baseline gap-1">
                                            $15.000 <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">COP</span>
                                        </div>
                                        
                                        <ul className="space-y-4 mb-8 w-full">
                                            <li className="flex items-center justify-center gap-3 text-sm text-slate-300">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                                <span className="font-medium">15 Créditos (3 Cambios)</span>
                                            </li>
                                            <li className="flex items-center justify-center gap-3 text-sm text-slate-300">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                                <span className="font-medium">Vigencia por 1 mes</span>
                                            </li>
                                        </ul>

                                        <a href="https://checkout.wompi.co/l/RECARGA_BASICA_PLACEHOLDER" target="_blank" className="relative group w-full py-3.5 rounded-xl font-extrabold text-white text-center shadow-lg transition-all duration-300 overflow-hidden bg-slate-700 hover:bg-slate-600 block text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                            <div className="absolute inset-0 w-full h-full bg-white/10 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
                                            <CreditCard className="w-4 h-4 relative z-10" />
                                            <span className="relative z-10">Comprar 15 Créditos</span>
                                        </a>
                                    </div>

                                    {/* OPCIÓN 2: PRO (Tema Llave en Mano) */}
                                    <div className="group relative bg-gradient-to-b from-blue-900/50 to-slate-900 border-2 border-blue-500 p-7 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.25)] flex flex-col items-center text-center overflow-hidden hover:border-blue-400 transition-all backdrop-blur-md">
                                        {/* Badge Mejor Valor */}
                                        <div className="absolute top-0 right-0">
                                            <div className="bg-gradient-to-r from-blue-500 to-violet-500 text-[9px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-tighter italic text-white shadow-lg">
                                                Mejor Valor
                                            </div>
                                        </div>

                                        <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                                            <Zap className="w-7 h-7 text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-black text-white mb-1 tracking-tight uppercase">RECARGA PRO</h3>
                                        <div className="text-3xl font-black text-white mb-6 flex items-baseline gap-1">
                                            $25.000 <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">COP</span>
                                        </div>
                                        
                                        <ul className="space-y-4 mb-8 w-full">
                                            <li className="flex items-center justify-center gap-3 text-sm text-slate-100">
                                                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                                                <span className="font-bold">30 Créditos (6 Cambios)</span>
                                            </li>
                                            <li className="flex items-center justify-center gap-3 text-sm text-slate-300">
                                                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                                                <span className="font-medium">Vigencia por 1 mes</span>
                                            </li>
                                        </ul>

                                        <a href="https://checkout.wompi.co/l/RECARGA_PRO_PLACEHOLDER" target="_blank" className="relative group w-full py-3.5 rounded-xl font-extrabold text-white text-center shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-blue-500/30 block text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                            <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
                                            <CreditCard className="w-4 h-4 relative z-10" />
                                            <span className="relative z-10">Comprar 30 Créditos</span>
                                        </a>
                                    </div>

                                </div>

                                {/* Footer info */}
                                <div className="mt-8 flex items-center justify-center gap-6 text-[9px] text-slate-500 uppercase tracking-[0.2em] font-black border-t border-white/[0.05] pt-6 group">
                                    <div className="flex items-center gap-2 group-hover:text-slate-400 transition-colors">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Pago Seguro vía Wompi
                                    </div>
                                    <div className="flex items-center gap-2 group-hover:text-slate-400 transition-colors">
                                        <Zap className="w-3.5 h-3.5" /> Activación Inmediata
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
