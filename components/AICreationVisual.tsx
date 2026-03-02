'use client';
import { motion } from 'framer-motion';
import { Code, Layout, Palette, Sparkles, Cpu } from 'lucide-react';

export default function AICreationVisual() {
    return (
        <div className="relative w-full h-[300px] flex items-center justify-center overflow-hidden rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-white/5">
            {/* Central AI Node */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-20 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40"
            >
                <Cpu className="text-white w-10 h-10 animate-pulse" />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-white rounded-3xl"
                />
            </motion.div>

            {/* Orbiting Elements */}
            <div className="absolute inset-0 z-10">
                {/* Code Element */}
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, 0],
                        x: [0, 10, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-12 left-1/4 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100 dark:border-slate-700"
                >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Code className="text-blue-500 w-4 h-4" />
                    </div>
                    <div className="space-y-1.5">
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        <div className="w-8 h-1.5 bg-slate-100 dark:bg-slate-600 rounded-full" />
                    </div>
                </motion.div>

                {/* Design Element */}
                <motion.div
                    animate={{
                        y: [0, 20, 0],
                        rotate: [0, -5, 0],
                        x: [0, -10, 0],
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute bottom-12 right-1/4 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100 dark:border-slate-700"
                >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Palette className="text-purple-500 w-4 h-4" />
                    </div>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-indigo-400" />
                        <div className="w-3 h-3 rounded-full bg-purple-400" />
                        <div className="w-3 h-3 rounded-full bg-pink-400" />
                    </div>
                </motion.div>

                {/* Layout Element */}
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 3, 0],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-1/2 right-12 -translate-y-1/2 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700"
                >
                    <Layout className="text-indigo-400 w-5 h-5 mb-2" />
                    <div className="grid grid-cols-2 gap-1 w-12 h-8">
                        <div className="bg-slate-100 dark:bg-slate-700 rounded" />
                        <div className="bg-slate-50 dark:bg-slate-600 rounded" />
                    </div>
                </motion.div>

                {/* Sparkles Floating Around */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -40, 0],
                            opacity: [0, 1, 0],
                            scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                            ease: "linear",
                        }}
                        className="absolute text-indigo-300 dark:text-indigo-400/50"
                        style={{
                            top: `${20 + Math.random() * 60}%`,
                            left: `${20 + Math.random() * 60}%`,
                        }}
                    >
                        <Sparkles className="w-4 h-4" />
                    </motion.div>
                ))}
            </div>

            {/* Connecting Lines (Background) */}
            <svg className="absolute inset-0 w-full h-full opacity-20 dark:opacity-10 pointer-events-none">
                <motion.path
                    d="M 25% 30% Q 50% 50% 75% 70%"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="text-indigo-400"
                />
                <motion.path
                    d="M 75% 30% Q 50% 50% 25% 70%"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    animate={{ strokeDashoffset: [0, 20] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="text-purple-400"
                />
            </svg>

            {/* AI Status Badge */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-black/5 dark:bg-white/5 backdrop-blur-md rounded-full border border-black/5 dark:border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                    AI Digital Architecture
                </span>
            </div>
        </div>
    );
}
