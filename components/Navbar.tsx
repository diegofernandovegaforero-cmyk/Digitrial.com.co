'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X, Triangle, ShoppingCart } from 'lucide-react';
import AnnouncementBar from './AnnouncementBar';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Evitar errores de hidratación
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed w-full z-50">
            <AnnouncementBar />
            <header className="w-full bg-slate-900/95 backdrop-blur-md border-b border-white/10 transition-colors">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Triangle className="text-white fill-white w-5 h-5" />
                        </div>
                        <div className="flex items-baseline">
                            <span className="font-extrabold text-xl tracking-tight uppercase text-white transition-colors">
                                DIGI<span className="text-blue-400">TRIAL</span>
                            </span>
                        </div>
                    </Link>

                    {/* Right side actions */}
                    <div className="flex items-center gap-2 md:gap-8">
                        {/* Desktop Menu Links */}
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                            <Link href="#" className="text-blue-400 font-semibold">Inicio</Link>
                            <Link href="#templates" className="hover:text-blue-400 transition text-slate-300">Diseños</Link>
                            <Link href="/login" className="hover:text-blue-400 transition text-slate-300">Iniciar sesión</Link>
                            <Link href="#contact" className="hover:text-blue-400 transition text-slate-300">Contacto</Link>

                            <div className="h-4 w-px bg-white/10 mx-2"></div>
                        </div>

                        <motion.div
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Link
                                href="https://ia.digitrial.com.co"
                                className="group relative hidden sm:flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl font-black text-slate-900 text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(163,255,18,0.3)] hover:shadow-[0_0_30px_rgba(163,255,18,0.5)] hover:-translate-y-0.5 overflow-hidden bg-[#A3FF12]"
                            >
                                <div className="absolute inset-0 w-full h-full bg-white/30 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
                                <span className="relative z-10 text-xs md:text-sm">Diseña tu Página Web Gratis con IA</span>
                            </Link>
                        </motion.div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-white p-2"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu Dropdown */}
                {isOpen && (
                    <div className="md:hidden bg-slate-900 border-t border-white/10 absolute w-full left-0 top-full shadow-2xl transition-colors">
                        <div className="flex flex-col p-6 space-y-4 font-medium text-white font-bold">
                            <Link href="#" onClick={() => setIsOpen(false)} className="hover:text-blue-400 transition-colors">Inicio</Link>
                            <Link href="#templates" onClick={() => setIsOpen(false)} className="hover:text-blue-400 transition-colors">Diseños</Link>
                            <Link href="/login" onClick={() => setIsOpen(false)} className="hover:text-blue-400 transition-colors">Iniciar sesión</Link>
                            <Link href="#contact" onClick={() => setIsOpen(false)} className="hover:text-blue-400 transition-colors">Contacto</Link>
                            <motion.div
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Link href="https://ia.digitrial.com.co" onClick={() => setIsOpen(false)}
                                    className="group relative flex items-center justify-center text-slate-900 px-6 py-4 rounded-2xl text-center font-black shadow-[0_0_20px_rgba(163,255,18,0.3)] overflow-hidden bg-[#A3FF12]"
                                >
                                    <div className="absolute inset-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-full animate-[shimmer_3s_infinite]" />
                                    <span className="relative z-10 text-xs uppercase tracking-wider font-bold">Diseña tu Página Web Gratis con IA</span>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
}
