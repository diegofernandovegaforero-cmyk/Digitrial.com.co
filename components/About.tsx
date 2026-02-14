'use client';
import Image from 'next/image';

export default function About() {
    return (
        <section className="py-24 px-6 bg-white overflow-hidden">
            <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl group">
                    <Image
                        src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80"
                        alt="Colaboración DIGITRIAL"
                        width={800}
                        height={600}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500"></div>
                </div>

                <div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight text-slate-900">
                        No somos solo una agencia.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Somos tu equipo extendido.</span>
                    </h2>
                    <p className="text-gray-500 text-lg mb-12 leading-relaxed">
                        En <strong>DIGITRIAL</strong>, fusionamos creatividad, datos y tecnología para construir soluciones que perduran.
                        No buscamos clientes, buscamos socios estratégicos para crecer juntos.
                    </p>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-12">
                        <div>
                            <p className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2">50+</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Proyectos Exitosos</p>
                        </div>
                        <div>
                            <p className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2">98%</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tasa de Fidelidad</p>
                        </div>
                        <div>
                            <p className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2">24/7</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Soporte Dedicado</p>
                        </div>
                        <div>
                            <p className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2">100%</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Compromiso</p>
                        </div>
                    </div>

                    <button className="mt-14 bg-slate-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg w-full sm:w-auto">
                        Hablemos de tu Proyecto
                    </button>
                </div>
            </div>
        </section>
    );
}
