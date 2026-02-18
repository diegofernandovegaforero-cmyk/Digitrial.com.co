'use client';
import { useCountUp } from '@/hooks/useCountUp';

export default function About() {
    const projectsCount = useCountUp(50, 2000);
    const fidelityCount = useCountUp(98, 2000);
    const commitmentCount = useCountUp(100, 2000);

    return (
        <section className="py-24 px-6 bg-white/80 overflow-hidden">
            <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl group">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    >
                        <source src="/videos/about-team.mp4.mp4" type="video/mp4" />
                    </video>
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
                        <div ref={projectsCount.elementRef}>
                            <p className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2">
                                {projectsCount.count}+
                            </p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Proyectos Exitosos</p>
                        </div>
                        <div ref={fidelityCount.elementRef}>
                            <p className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2">
                                {fidelityCount.count}%
                            </p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tasa de Fidelidad</p>
                        </div>
                        <div>
                            <p className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2">24/7</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Soporte Dedicado</p>
                        </div>
                        <div ref={commitmentCount.elementRef}>
                            <p className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2">
                                {commitmentCount.count}%
                            </p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Compromiso</p>
                        </div>
                    </div>

                    <a
                        href="https://wa.me/573123299053"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-14 bg-slate-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto text-center inline-block"
                    >
                        Hablemos de tu Proyecto
                    </a>
                </div>
            </div>
        </section>
    );
}
