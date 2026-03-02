'use client';
import { useCountUp } from '@/hooks/useCountUp';
import WavesBackground from './WavesBackground';

export default function About() {
    const projectsCount = useCountUp(50, 2000);
    const fidelityCount = useCountUp(98, 2000);
    const commitmentCount = useCountUp(100, 2000);

    return (
        <section className="py-24 px-6 bg-white/65 overflow-hidden relative">
            <WavesBackground />
            <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
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
                        className="group relative mt-14 px-10 py-4 rounded-xl font-extrabold text-white text-center inline-block shadow-lg hover:shadow-blue-500/30 transition-all duration-300 overflow-hidden bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 w-full sm:w-auto"
                    >
                        <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
                        <span className="relative z-10">Hablemos de tu Proyecto</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
