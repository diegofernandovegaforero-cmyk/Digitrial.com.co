'use client';
import Link from 'next/link';
import { Mail, MapPin, Phone, Linkedin, Instagram, Facebook, Triangle } from 'lucide-react';

export default function Footer() {
    return (
        <footer id="contact" className="bg-slate-900 text-white pt-24 pb-12 px-6">
            <div className="container mx-auto">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 md:p-12 rounded-[2.5rem] mb-20 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white leading-tight">¿Listo para el siguiente nivel?</h2>
                            <p className="text-slate-400 italic text-lg mb-8">"En <strong>DIGITRIAL</strong>, diseñamos soluciones que se convierten en el motor de tu crecimiento."</p>
                            <div className="flex flex-wrap gap-4">
                                <button className="bg-green-500 hover:bg-green-600 transition px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-white shadow-lg shadow-green-900/20">
                                    <Phone className="w-5 h-5" /> WhatsApp
                                </button>
                                <button className="bg-slate-700 hover:bg-slate-600 transition px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-white border border-slate-600">
                                    <Mail className="w-5 h-5" /> Email
                                </button>
                            </div>
                        </div>
                        <div className="bg-slate-950/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 text-sm space-y-4">
                            <div className="flex items-center gap-4 text-white">
                                <MapPin className="text-blue-500 w-5 h-5" />
                                <span>Pitalito Huila, Colombia</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-300">
                                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                </div>
                                Atención Personalizada
                            </div>
                            <div className="flex items-center gap-4 text-slate-300">
                                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                </div>
                                Estrategia 360°
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 text-sm border-t border-slate-800 pt-16">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                                <Triangle className="text-white fill-white w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-extrabold text-lg uppercase leading-none">DIGI<span className="text-blue-500">TRIAL</span></span>
                            </div>
                        </div>
                        <p className="text-slate-500 leading-relaxed mb-6">
                            Transformando ideas en experiencias digitales excepcionales desde Pitalito para el mundo.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                                <Facebook className="w-4 h-4" />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-600 hover:text-white transition-all">
                                <Instagram className="w-4 h-4" />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-700 hover:text-white transition-all">
                                <Linkedin className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 uppercase text-xs text-slate-400 tracking-wider">Servicios</h4>
                        <ul className="space-y-4 text-slate-500">
                            <li><Link href="#services" className="hover:text-blue-400 transition">Desarrollo Web</Link></li>
                            <li><Link href="#services" className="hover:text-blue-400 transition">Landing Pages</Link></li>
                            <li><Link href="#services" className="hover:text-blue-400 transition">Funnels de Venta</Link></li>
                            <li><Link href="#services" className="hover:text-blue-400 transition">Manejo de Redes</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 uppercase text-xs text-slate-400 tracking-wider">Compañía</h4>
                        <ul className="space-y-4 text-slate-500">
                            <li><Link href="#" className="hover:text-blue-400 transition">Sobre Nosotros</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition">Casos de Éxito</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition">Blog</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition">Términos y Condiciones</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 uppercase text-xs text-slate-400 tracking-wider">Contacto</h4>
                        <ul className="space-y-4 text-slate-500">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-slate-600 mt-0.5" />
                                <span>Pitalito Huila, Colombia</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-slate-600" />
                                <span>+57 312 329 9053</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <a
                                    href="mailto:digitrialsolucionesdigitales@gmail.com"
                                    className="flex items-center gap-3 hover:text-blue-400 transition-colors"
                                >
                                    <Mail className="w-5 h-5 text-slate-600" />
                                    <span>digitrialsolucionesdigitales@gmail.com</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="text-center mt-20 pt-8 border-t border-slate-800 text-slate-600 text-xs">
                    © {new Date().getFullYear()} DIGITRIAL. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}
