'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Triangle, Layout, LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AnnouncementBar from './AnnouncementBar';

export default function Navbar() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (err) {
            console.error("Error signing out:", err);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    return (
        <div className="fixed w-full z-50">
            <AnnouncementBar />
            <header className={`w-full transition-all duration-300 ${
                isScrolled
                    ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm'
                    : 'bg-[#0B1221]/90 backdrop-blur-md border-b border-white/5'
            }`}>
                <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Triangle className="text-white fill-white w-4 h-4" />
                        </div>
                        <span className={`font-extrabold text-[clamp(14px,3vw,20px)] tracking-tight uppercase transition-colors duration-300 ${
                            isScrolled ? 'text-slate-500' : 'text-white'
                        }`}>
                            DIGI<span className={isScrolled ? 'text-blue-600' : 'text-blue-400'}>TRIAL</span>
                        </span>
                    </Link>

                    {/* Right side */}
                    <div className="flex items-center gap-3 sm:gap-6">

                        {/* Desktop links — ocultos en móvil pequeño */}
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <Link href="#" className={`${isScrolled ? 'text-blue-600' : 'text-blue-400'} font-semibold transition-colors duration-300`}>
                                Inicio
                            </Link>
                            <Link href="/ia" className={`transition-colors duration-300 ${
                                isScrolled ? 'text-slate-600 hover:text-blue-600' : 'text-slate-300 hover:text-white'
                            }`}>IA</Link>
                            {user && (
                                <Link href="/proyectos" className={`transition-colors duration-300 ${
                                    isScrolled ? 'text-slate-600 hover:text-blue-600' : 'text-slate-300 hover:text-white'
                                } flex items-center gap-1.5`}>
                                    <Layout className="w-3.5 h-3.5" />
                                    Mis Proyectos
                                </Link>
                            )}
                            {user ? (
                                <button 
                                    onClick={handleLogout}
                                    className={`transition-colors duration-300 flex items-center gap-1.5 ${
                                        isScrolled ? 'text-slate-600 hover:text-blue-600' : 'text-slate-300 hover:text-white'
                                    }`}
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    Cerrar Sesión
                                </button>
                            ) : (
                                <Link href="#contact" className={`transition-colors duration-300 ${
                                    isScrolled ? 'text-slate-600 hover:text-blue-600' : 'text-slate-300 hover:text-white'
                                }`}>Contacto</Link>
                            )}
                            <div className={`h-4 w-px ${isScrolled ? 'bg-slate-200' : 'bg-white/10'}`} />
                        </div>

                        {/* Botón Iniciar Sesión — visible en sm+ */}
                        <motion.div
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="hidden sm:block"
                        >
                            <Link
                                href={user ? "/proyectos" : "/login"}
                                className="flex items-center justify-center px-5 py-2 rounded-2xl font-black text-white text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:bg-blue-700 hover:-translate-y-0.5 bg-blue-600 whitespace-nowrap"
                            >
                                {user ? "Mi Panel" : "Iniciar Sesión"}
                            </Link>
                        </motion.div>

                        {/* Botón "Menú" estilo Nu bank — solo en móvil */}
                        <button
                            className={`md:hidden flex items-center gap-1.5 text-sm font-bold tracking-wide transition-colors duration-300 ${
                                isScrolled ? 'text-slate-900' : 'text-white'
                            }`}
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
                        >
                            <span>Menú</span>
                            {/* 3 Líneas / X animada */}
                            <span className="flex flex-col gap-[4px] w-5 justify-center h-4 relative">
                                <span className={`block h-[2px] w-full rounded-full transition-all duration-300 ${isScrolled ? 'bg-slate-900' : 'bg-white'} ${isOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
                                <span className={`block h-[2px] w-full rounded-full transition-all duration-300 ${isScrolled ? 'bg-slate-900' : 'bg-white'} ${isOpen ? 'opacity-0' : ''}`} />
                                <span className={`block h-[2px] w-full rounded-full transition-all duration-300 ${isScrolled ? 'bg-slate-900' : 'bg-white'} ${isOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
                            </span>
                        </button>
                    </div>
                </nav>

                {/* Mobile Dropdown */}
                {isOpen && (
                    <div className={`md:hidden backdrop-blur-xl border-t absolute w-full left-0 top-full shadow-2xl ${
                        isScrolled ? 'bg-white/95 border-slate-200' : 'bg-slate-900 border-white/10'
                    }`}>
                        <div className={`flex flex-col p-6 space-y-5 font-bold ${
                            isScrolled ? 'text-slate-900' : 'text-white'
                        }`}>
                            <Link href="#" onClick={() => setIsOpen(false)} className={`text-base transition-colors duration-300 ${isScrolled ? 'hover:text-blue-600' : 'hover:text-blue-400'}`}>Inicio</Link>
                            <Link href="/ia" onClick={() => setIsOpen(false)} className={`text-base transition-colors duration-300 ${isScrolled ? 'hover:text-blue-600' : 'hover:text-blue-400'}`}>IA</Link>
                            {user && <Link href="/proyectos" onClick={() => setIsOpen(false)} className={`text-base transition-colors duration-300 ${isScrolled ? 'hover:text-blue-600' : 'hover:text-blue-400'}`}>Mis Proyectos</Link>}
                            {user ? (
                                <button 
                                    onClick={() => {
                                        handleLogout();
                                        setIsOpen(false);
                                    }} 
                                    className={`text-base transition-colors duration-300 flex items-center gap-2 ${
                                        isScrolled ? 'hover:text-blue-600' : 'hover:text-blue-400'
                                    }`}
                                >
                                    <LogOut className="w-4 h-4" />
                                    Cerrar Sesión
                                </button>
                            ) : (
                                <Link href="#contact" onClick={() => setIsOpen(false)} className={`text-base transition-colors duration-300 ${isScrolled ? 'hover:text-blue-600' : 'hover:text-blue-400'}`}>Contacto</Link>
                            )}
                            <Link
                                href={user ? "/proyectos" : "/login"}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center text-white px-6 py-4 rounded-2xl text-center font-black shadow-xl bg-blue-600 shadow-blue-600/20 active:bg-blue-700 transition-colors duration-300 text-xs uppercase tracking-wider"
                            >
                                {user ? "Mi Panel" : "Iniciar Sesión"}
                            </Link>
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
}
