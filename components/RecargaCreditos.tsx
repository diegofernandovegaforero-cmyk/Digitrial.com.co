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
                        <div className="bg-gradient-to-b from-[#1A0B2E] to-[#0A0410] backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] relative">
                            {/* Resplandores decorativos internos */}
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] -z-10" />
                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] -z-10" />

                            {/* Close */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all z-20"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-8 relative z-10">
                                {/* Header */}
                                <div className="text-center mb-10">
                                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                        <Zap className="w-4 h-4 text-blue-400" />
                                        <span className="text-blue-300 text-[10px] font-black uppercase tracking-[0.2em]">Recarga de Créditos</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-white mb-3 italic tracking-tight">¡No detengas tu creatividad!</h2>
                                    <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                                        Te has quedado sin intentos. Recarga ahora y sigue perfeccionando tu web con el poder de la IA.
                                    </p>
                                </div>

                                {/* Opciones */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                                    
                                    {/* OPCIÓN 1: Básica */}
                                    <div className="group relative bg-white/[0.03] border border-white/10 p-7 rounded-2xl hover:border-purple-500/30 transition-all flex flex-col items-center text-center backdrop-blur-sm overflow-hidden shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
                                        {/* Glow hover */}
                                        <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/[0.02] transition-colors" />

                                        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                            <Sparkles className="w-7 h-7 text-purple-400" />
                                        </div>
                                        <h3 className="text-xl font-black text-white mb-1 tracking-tight">Recarga Básica</h3>
                                        <div className="text-3xl font-black text-white mb-6 flex items-baseline gap-1">
                                            $15.000 <span className="text-[10px] text-slate-500 font-bold tracking-widest">COP</span>
                                        </div>
                                        
                                        <ul className="space-y-4 mb-8 w-full">
                                            <li className="flex items-center justify-center gap-3 text-sm text-slate-300">
                                                <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center">
                                                    <CheckCircle2 className="w-3 h-3 text-purple-400" />
                                                </div>
                                                <span className="font-medium">15 Créditos (3 Cambios)</span>
                                            </li>
                                            <li className="flex items-center justify-center gap-3 text-sm text-slate-300">
                                                <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center">
                                                    <CheckCircle2 className="w-3 h-3 text-purple-400" />
                                                </div>
                                                <span className="font-medium">Vigencia por 1 mes</span>
                                            </li>
                                        </ul>

                                        <a href="https://checkout.wompi.co/l/RECARGA_BASICA_PLACEHOLDER" target="_blank" className="w-full bg-white text-black py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-purple-100 transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-2 group/btn">
                                            <CreditCard className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> Comprar 15 Créditos
                                        </a>
                                    </div>

                                    {/* OPCIÓN 2: PRO */}
                                    <div className="group relative bg-gradient-to-b from-blue-600/[0.08] to-indigo-600/[0.04] border-2 border-blue-500/40 p-7 rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.1)] flex flex-col items-center text-center overflow-hidden hover:border-blue-400/60 transition-all">
                                        {/* Badge Mejor Valor */}
                                        <div className="absolute top-0 right-0">
                                            <div className="bg-blue-600 text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-tighter italic text-white shadow-lg">
                                                Mejor Valor
                                            </div>
                                        </div>

                                        <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                                            <Zap className="w-7 h-7 text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-black text-white mb-1 tracking-tight uppercase">RECARGA PRO</h3>
                                        <div className="text-3xl font-black text-white mb-6 flex items-baseline gap-1">
                                            $25.000 <span className="text-[10px] text-slate-500 font-bold tracking-widest">COP</span>
                                        </div>
                                        
                                        <ul className="space-y-4 mb-8 w-full">
                                            <li className="flex items-center justify-center gap-3 text-sm text-slate-100">
                                                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                    <CheckCircle2 className="w-3 h-3 text-blue-400" />
                                                </div>
                                                <span className="font-bold">30 Créditos (6 Cambios)</span>
                                            </li>
                                            <li className="flex items-center justify-center gap-3 text-sm text-slate-300">
                                                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                    <CheckCircle2 className="w-3 h-3 text-blue-400" />
                                                </div>
                                                <span className="font-medium">Vigencia por 1 mes</span>
                                            </li>
                                        </ul>

                                        <a href="https://checkout.wompi.co/l/RECARGA_PRO_PLACEHOLDER" target="_blank" className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:from-blue-500 hover:to-indigo-600 transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2 group/btn">
                                            <CreditCard className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> Comprar 30 Créditos
                                        </a>
                                    </div>

                                </div>

                                {/* Footer info */}
                                <div className="mt-8 flex items-center justify-center gap-6 text-[9px] text-slate-500 uppercase tracking-[0.2em] font-black border-t border-white/[0.03] pt-6 group">
                                    <div className="flex items-center gap-2 group-hover:text-slate-400 transition-colors">
                                        <ShieldCheck className="w-3.5 h-3.5 text-green-500/50" /> Pago Seguro vía Wompi
                                    </div>
                                    <div className="flex items-center gap-2 group-hover:text-slate-400 transition-colors">
                                        <Zap className="w-3.5 h-3.5 text-blue-500/50" /> Activación Inmediata
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
