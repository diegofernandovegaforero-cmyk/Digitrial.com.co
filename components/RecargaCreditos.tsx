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
                        <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/20 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                            {/* Close */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-8">
                                {/* Header */}
                                <div className="text-center mb-10">
                                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1 mb-4">
                                        <Zap className="w-4 h-4 text-blue-400" />
                                        <span className="text-blue-300 text-xs font-bold uppercase tracking-widest">Recarga de Créditos</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-white mb-2 italic">¡No detengas tu creatividad!</h2>
                                    <p className="text-slate-400 text-sm max-w-md mx-auto">
                                        Te has quedado sin intentos. Recarga ahora y sigue perfeccionando tu web con el poder de la IA.
                                    </p>
                                </div>

                                {/* Opciones */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    {/* OPCIÓN 1: Básica */}
                                    <div className="group bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-blue-500/50 transition-all flex flex-col items-center text-center">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Sparkles className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1">Recarga Básica</h3>
                                        <div className="text-3xl font-black text-white mb-4">$15.000 <span className="text-xs text-slate-500">COP</span></div>
                                        
                                        <ul className="space-y-3 mb-8 w-full">
                                            <li className="flex items-center justify-center gap-2 text-sm text-slate-300">
                                                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                                <span>15 Créditos (3 Cambios)</span>
                                            </li>
                                            <li className="flex items-center justify-center gap-2 text-sm text-slate-300">
                                                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                                <span>Vigencia por 1 mes</span>
                                            </li>
                                        </ul>

                                        <a href="https://checkout.wompi.co/l/RECARGA_BASICA_PLACEHOLDER" target="_blank" className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-blue-400 hover:text-white transition-all shadow-lg flex items-center justify-center gap-2">
                                            <CreditCard className="w-4 h-4" /> Comprar 15 Créditos
                                        </a>
                                    </div>

                                    {/* OPCIÓN 2: PRO */}
                                    <div className="group relative bg-gradient-to-b from-blue-900/20 to-purple-900/10 border-2 border-blue-500/50 p-6 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col items-center text-center overflow-hidden">
                                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase italic animate-pulse">
                                            Mejor Valor
                                        </div>
                                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Zap className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-tighter">Recarga PRO</h3>
                                        <div className="text-3xl font-black text-white mb-4">$25.000 <span className="text-xs text-slate-500">COP</span></div>
                                        
                                        <ul className="space-y-3 mb-8 w-full">
                                            <li className="flex items-center justify-center gap-2 text-sm text-slate-200">
                                                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                                <span className="font-bold text-white">30 Créditos (6 Cambios)</span>
                                            </li>
                                            <li className="flex items-center justify-center gap-2 text-sm text-slate-300">
                                                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                                <span>Vigencia por 1 mes</span>
                                            </li>
                                        </ul>

                                        <a href="https://checkout.wompi.co/l/RECARGA_PRO_PLACEHOLDER" target="_blank" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2">
                                            <CreditCard className="w-4 h-4" /> Comprar 30 Créditos
                                        </a>
                                    </div>

                                </div>

                                {/* Footer info */}
                                <div className="mt-8 flex items-center justify-center gap-6 text-[10px] text-slate-500 uppercase tracking-widest font-bold border-t border-white/5 pt-6">
                                    <div className="flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Pago Seguro vía Wompi
                                    </div>
                                    <div className="flex items-center gap-1.5">
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
