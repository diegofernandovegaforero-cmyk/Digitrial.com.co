'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
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
            <header className="w-full bg-white/90 backdrop-blur-md border-b border-gray-100 transition-colors dark:bg-slate-950/90 dark:border-slate-800">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Triangle className="text-white fill-white w-5 h-5" />
                        </div>
                        <div className="flex items-baseline">
                            <span className="font-extrabold text-xl tracking-tight uppercase text-slate-500 dark:text-white transition-colors">
                                DIGI<span className="text-blue-600">TRIAL</span>
                            </span>
                        </div>
                    </Link>

                    {/* Right side actions */}
                    <div className="flex items-center gap-2 md:gap-8">
                        {/* Desktop Menu Links */}
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                            <Link href="#" className="text-blue-600 font-semibold">Inicio</Link>
                            <Link href="#templates" className="hover:text-blue-600 transition text-gray-600 dark:text-gray-300">Diseños</Link>
                            <Link href="https://ia.digitrial.com.co" className="hover:text-blue-600 transition text-gray-600 dark:text-gray-300">Tienda</Link>
                            <Link href="#contact" className="hover:text-blue-600 transition text-gray-600 dark:text-gray-300">Contacto</Link>

                            <div className="h-4 w-px bg-gray-200 dark:bg-slate-700 mx-2"></div>
                        </div>

                        {/* Shopping Cart Link - Replaces Theme Toggle */}
                        <Link
                            href="https://ia.digitrial.com.co"
                            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
                            aria-label="Ir a la tienda"
                        >
                            <ShoppingCart className="w-5 h-5" />
                        </Link>

                        {/* Desktop CTA (Hidden on mobile < sm) */}
                        <Link
                            href="https://ia.digitrial.com.co"
                            className="group relative hidden sm:flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl font-extrabold text-white text-xs uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 overflow-hidden bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500"
                        >
                            <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
                            <span className="relative z-10 text-xs md:text-sm">Diseña tu Página Web Gratis con IA</span>
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-slate-900 dark:text-white p-2"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu Dropdown */}
                {isOpen && (
                    <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 absolute w-full left-0 top-full shadow-xl transition-colors">
                        <div className="flex flex-col p-6 space-y-4 font-medium text-slate-900 dark:text-white">
                            <Link href="#" onClick={() => setIsOpen(false)} className="hover:text-blue-600 transition-colors">Inicio</Link>
                            <Link href="#templates" onClick={() => setIsOpen(false)} className="hover:text-blue-600 transition-colors">Diseños</Link>
                            <Link href="https://ia.digitrial.com.co" onClick={() => setIsOpen(false)} className="hover:text-blue-600 transition-colors">Tienda</Link>
                            <Link href="#contact" onClick={() => setIsOpen(false)} className="hover:text-blue-600 transition-colors">Contacto</Link>
                            <Link href="https://ia.digitrial.com.co" onClick={() => setIsOpen(false)}
                                className="group relative flex items-center justify-center text-white px-6 py-4 rounded-2xl text-center font-extrabold shadow-lg overflow-hidden bg-gradient-to-r from-blue-600 to-violet-600"
                            >
                                <div className="absolute inset-0 w-full h-full bg-white/10 -skew-x-12 -translate-x-full animate-[shimmer_3s_infinite]" />
                                <span className="relative z-10 text-xs uppercase tracking-wider font-bold">Diseña tu Página Web Gratis con IA</span>
                            </Link>
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
}
