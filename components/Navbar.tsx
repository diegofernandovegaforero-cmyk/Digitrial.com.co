'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Moon, Menu, X, Triangle } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Evitar errores de hidratación
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
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
                        <Link href="#services" className="hover:text-blue-600 transition text-gray-600 dark:text-gray-300">Servicios</Link>
                        <Link href="#services" className="hover:text-blue-600 transition text-gray-600 dark:text-gray-300">Tienda</Link>
                        <Link href="#contact" className="hover:text-blue-600 transition text-gray-600 dark:text-gray-300">Contacto</Link>

                        <div className="h-4 w-px bg-gray-200 dark:bg-slate-700 mx-2"></div>
                    </div>

                    {/* Theme Toggle - Always Visible */}
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
                        aria-label="Alternar modo oscuro"
                    >
                        {mounted && (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
                        {!mounted && <Sun className="w-5 h-5 opacity-0" />}
                    </button>

                    {/* Desktop CTA (Hidden on mobile < sm) */}
                    <Link
                        href="/disena-tu-pagina"
                        className="hidden sm:flex text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
                        style={{ background: 'linear-gradient(90deg, #1E3A8A 0%, #7C3AED 50%, #E11D48 100%)' }}
                    >
                        Diseña tu Página Web Gratis
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
                        <Link href="#services" onClick={() => setIsOpen(false)} className="hover:text-blue-600 transition-colors">Servicios</Link>
                        <Link href="#services" onClick={() => setIsOpen(false)} className="hover:text-blue-600 transition-colors">Tienda</Link>
                        <Link href="#contact" onClick={() => setIsOpen(false)} className="hover:text-blue-600 transition-colors">Contacto</Link>
                        <Link href="/disena-tu-pagina" onClick={() => setIsOpen(false)}
                            className="text-white px-6 py-3 rounded-lg text-center font-bold shadow-lg"
                            style={{ background: 'linear-gradient(90deg, #1E3A8A 0%, #7C3AED 50%, #E11D48 100%)' }}>
                            Diseña tu Página Web Gratis
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
