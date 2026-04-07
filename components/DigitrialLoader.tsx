'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Triangle } from 'lucide-react';

interface DigitrialLoaderProps {
    message?: string;
    subtext?: string;
}

export default function DigitrialLoader({ message, subtext }: DigitrialLoaderProps) {
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
                
                {/* ─── Outer Rotating Rings ─── */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-3xl border border-blue-500/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 rounded-3xl border border-indigo-500/10"
                />
                
                {/* ─── Pulsing Glow ─── */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-24 h-24 bg-blue-600/20 blur-2xl rounded-full"
                />

                {/* ─── Central Logo Card ─── */}
                <motion.div
                    animate={{
                        y: [0, -5, 0],
                        rotateY: [0, 10, -10, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_10px_40px_rgba(37,99,235,0.4)] border border-white/20"
                >
                    <Triangle className="text-white fill-white w-7 h-7" />
                    
                    {/* Corner accents */}
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-white/40 rounded-tl-sm" />
                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-white/40 rounded-br-sm" />
                </motion.div>

                {/* ─── Orbiting Particles ─── */}
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 3 + i,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="absolute inset-0 pointer-events-none"
                    >
                        <div 
                            className="w-1 h-1 bg-blue-400 rounded-full absolute shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                            style={{ 
                                top: `${15 + (i * 5)}%`, 
                                left: '50%',
                                opacity: 0.6
                            }} 
                        />
                    </motion.div>
                ))}
            </div>

            {/* ─── Text Content ─── */}
            <AnimatePresence>
                {(message || subtext) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-10 text-center space-y-2"
                    >
                        {message && (
                            <h3 className="text-xl font-black italic tracking-tighter text-white">
                                {message.split('').map((char, i) => (
                                    <motion.span
                                        key={i}
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.05 }}
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                            </h3>
                        )}
                        {subtext && (
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/60">
                                {subtext}
                            </p>
                        )}
                        
                        {/* Progressive bar */}
                        <div className="w-48 h-1 bg-white/5 rounded-full mx-auto mt-4 overflow-hidden border border-white/5">
                            <motion.div
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="w-1/2 h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
