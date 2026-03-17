'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X, Triangle, ShoppingCart } from 'lucide-react';
import AnnouncementBar from './AnnouncementBar';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Manejar el scroll para cambiar el tema
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Evitar errores de hidratación
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed w-full z-50">
            <AnnouncementBar />
            <header className={`w-full transition-all duration-300 ${
                isScrolled 
                ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm' 
                : 'bg-[#0B1221]/90 backdrop-blur-md border-b border-white/5'
            }`}>
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Triangle className="text-white fill-white w-5 h-5" />
                        </div>
                        <div className="flex items-baseline">
                            <span className={`font-extrabold text-xl tracking-tight uppercase transition-colors duration-300 ${
                                isScrolled ? 'text-slate-500' : 'text-white'
                            }`}>
                                DIGI<span className={isScrolled ? 'text-blue-600' : 'text-blue-400'}>TRIAL</span>
                            </span>
                        </div>
                    </Link>

                    {/* Right side actions */}
                    <div className="flex items-center gap-2 md:gap-8">
                        {/* Desktop Menu Links */}
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                            <Link href="#" className={`${isScrolled ? 'text-blue-600' : 'text-blue-400'} font-semibold transition-colors duration-300`}>Inicio</Link>
                            <Link href="#templates" className={`transition-colors duration-300 ${
                                isScrolled ? 'text-slate-600 hover:text-blue-600' : 'text-slate-300 hover:text-white'
                            }`}>Diseños</Link>
                            <Link href="/login" className={`transition-colors duration-300 ${
                                isScrolled ? 'text-slate-600 hover:text-blue-600' : 'text-slate-300 hover:text-white'
                            }`}>Iniciar sesión</Link>
                            <Link href="#contact" className={`transition-colors duration-300 ${
                                isScrolled ? 'text-slate-600 hover:text-blue-600' : 'text-slate-300 hover:text-white'
                            }`}>Contacto</Link>

                            <div className={`h-4 w-px transition-colors duration-300 ${isScrolled ? 'bg-slate-200' : 'bg-white/10'} mx-2`}></div>
                        </div>

                        <motion.div
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Link
                                href="/login"
                                className="group relative hidden sm:flex items-center justify-center gap-2 px-8 py-2.5 rounded-2xl font-black text-white text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shadow-blue-900/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800"
                            >
                                <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
                                <span className="relative z-10 text-xs md:text-sm">Iniciar Sesión</span>
                            </Link>
                        </motion.div>

                        {/* Mobile Menu Button */}
                        <button
                            className={`md:hidden p-2 transition-colors duration-300 ${isScrolled ? 'text-slate-900' : 'text-white'}`}
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu Dropdown */}
                {isOpen && (
                    <div className={`md:hidden backdrop-blur-xl border-t absolute w-full left-0 top-full shadow-2xl transition-all duration-300 ${
                        isScrolled ? 'bg-white/95 border-slate-200' : 'bg-slate-900 border-white/10'
                    }`}>
                        <div className={`flex flex-col p-6 space-y-4 font-medium font-bold ${
                            isScrolled ? 'text-slate-900' : 'text-white'
                        }`}>
                            <Link href="#" onClick={() => setIsOpen(false)} className={`transition-colors duration-300 ${isScrolled ? 'hover:text-blue-600' : 'hover:text-blue-400'}`}>Inicio</Link>
                            <Link href="#templates" onClick={() => setIsOpen(false)} className={`transition-colors duration-300 ${isScrolled ? 'hover:text-blue-600' : 'hover:text-blue-400'}`}>Diseños</Link>
                            <Link href="/login" onClick={() => setIsOpen(false)} className={`transition-colors duration-300 ${isScrolled ? 'hover:text-blue-600' : 'hover:text-blue-400'}`}>Iniciar sesión</Link>
                            <Link href="#contact" onClick={() => setIsOpen(false)} className={`transition-colors duration-300 ${isScrolled ? 'hover:text-blue-600' : 'hover:text-blue-400'}`}>Contacto</Link>
                            <motion.div
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Link href="/login" onClick={() => setIsOpen(false)}
                                    className="group relative flex items-center justify-center text-white px-6 py-4 rounded-2xl text-center font-black shadow-xl overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800"
                                >
                                    <div className="absolute inset-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-full animate-[shimmer_3s_infinite]" />
                                    <span className="relative z-10 text-xs uppercase tracking-wider font-bold">Iniciar Sesión</span>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
}
