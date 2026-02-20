'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Sun, Menu, X, Triangle } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Triangle className="text-white fill-white w-5 h-5" />
                    </div>
                    <div className="flex items-baseline">
                        <span className="font-extrabold text-xl tracking-tight uppercase text-slate-500">
                            DIGI<span className="text-blue-600">TRIAL</span>
                        </span>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link href="#" className="text-blue-600 font-semibold">Inicio</Link>
                    <Link href="#services" className="hover:text-blue-600 transition text-gray-600">Servicios</Link>
                    <Link href="#services" className="hover:text-blue-600 transition text-gray-600">Tienda</Link>
                    <Link href="#contact" className="hover:text-blue-600 transition text-gray-600">Contacto</Link>

                    <div className="h-4 w-px bg-gray-200 mx-2"></div>

                    <Link href="#" className="text-gray-600 hover:text-blue-600 transition">
                        <Sun className="w-5 h-5" />
                    </Link>

                    <Link
                        href="https://wa.me/573123299053"
                        target="_blank"
                        className="text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(90deg, #1E3A8A 0%, #7C3AED 50%, #E11D48 100%)' }}
                    >
                        Asesoría Premium Gratuita
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-slate-900"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </nav>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 top-full shadow-xl">
                    <div className="flex flex-col p-6 space-y-4 font-medium text-slate-900">
                        <Link href="#" onClick={() => setIsOpen(false)} className="hover:text-blue-600">Inicio</Link>
                        <Link href="#services" onClick={() => setIsOpen(false)} className="hover:text-blue-600">Servicios</Link>
                        <Link href="#services" onClick={() => setIsOpen(false)} className="hover:text-blue-600">Tienda</Link>
                        <Link href="#contact" onClick={() => setIsOpen(false)} className="hover:text-blue-600">Contacto</Link>
                        <Link href="https://wa.me/573123299053" onClick={() => setIsOpen(false)}
                            className="text-white px-6 py-3 rounded-lg text-center font-bold"
                            style={{ background: 'linear-gradient(90deg, #1E3A8A 0%, #7C3AED 50%, #E11D48 100%)' }}>
                            Asesoría Premium Gratuita
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
