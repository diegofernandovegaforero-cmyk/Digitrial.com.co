import Image from 'next/image';
import { useCountUp } from '@/hooks/useCountUp';
import WavesBackground from './WavesBackground';
import { motion } from 'framer-motion';
import AICreationVisual from './AICreationVisual';

export default function About() {
    const projectsCount = useCountUp(50, 2500);
    const fidelityCount = useCountUp(98, 2500);
    const commitmentCount = useCountUp(100, 2500);

    return (
        <section id="about" className="py-24 px-6 bg-white dark:bg-slate-950 overflow-hidden relative z-30">
            <WavesBackground />
            <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
                {/* Illustration & Visual Column */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    <AICreationVisual />

                    <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-50 dark:bg-slate-900/50 p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-2xl group transition-all duration-500 hover:shadow-indigo-500/10">
                        <Image
                            src="/images/about/team_illustration.png"
                            alt="Digital Team Collaboration"
                            width={800}
                            height={600}
                            className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-700"
                        />
                        {/* Decorative floating elements */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
                        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                </motion.div>

                {/* Content Column */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight text-slate-900 dark:text-white">
                        No somos solo una agencia.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Somos tu equipo extendido.</span>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-12 leading-relaxed">
                        Webs modernas con IA en minutos · E-commerce Shopify a medida · Diseño ágil sin barreras · Multiplica. tus. ventas. hoy.
                    </p>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-12">
                        <div ref={projectsCount.elementRef}>
                            <p className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
                                {projectsCount.count}+
                            </p>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Proyectos Exitosos</p>
                        </div>
                        <div ref={fidelityCount.elementRef}>
                            <p className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
                                {fidelityCount.count}%
                            </p>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tasa de Fidelidad</p>
                        </div>
                        <div>
                            <p className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-2">24/7</p>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Soporte Dedicado</p>
                        </div>
                        <div ref={commitmentCount.elementRef}>
                            <p className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
                                {commitmentCount.count}%
                            </p>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Compromiso</p>
                        </div>
                    </div>

                    <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href="https://wa.me/573123299053"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative mt-14 px-10 py-5 rounded-2xl font-extrabold text-white text-center inline-block shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 overflow-hidden bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                    >
                        <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
                        <span className="relative z-10 text-lg">Hablemos de tu Proyecto</span>
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
}
