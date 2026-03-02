'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useInView } from 'framer-motion';
import { Code, Layout, ShoppingCart, Smartphone, Users, Video } from 'lucide-react';
import WavesBackground from './WavesBackground';

const templates = [
    {
        title: "Gastronomía: LaBurguer",
        description: "Diseño audaz y apetecible para restaurantes de comida rápida gourmet que buscan impacto visual.",
        icon: <ShoppingCart className="w-6 h-6" />,
        image: "/images/templates/laburguer.png",
        color: "bg-red-50 text-red-600"
    },
    {
        title: "Cortes Premium: Yanapore",
        description: "Elegancia y sofisticación para parrillas y restaurantes de alta cocina con enfoque en la tradición.",
        icon: <Users className="w-6 h-6" />,
        image: "/images/templates/yanapore.png",
        color: "bg-amber-50 text-amber-600"
    },
    {
        title: "Tradición: MasaViva",
        description: "Un tributo a lo artesanal con un toque moderno para panaderías y negocios de comida típica.",
        icon: <Layout className="w-6 h-6" />,
        image: "/images/templates/masaviva.png",
        color: "bg-orange-50 text-orange-600"
    },
    {
        title: "Fitness: Big Fit",
        description: "Energía pura y potencia para gimnasios, suplementos y equipamiento deportivo profesional.",
        icon: <Smartphone className="w-6 h-6" />,
        image: "/images/templates/bigfit.png",
        color: "bg-orange-50 text-orange-600"
    },
    {
        title: "Automotriz: SuccessCar",
        description: "Confianza y robustez para repuestos, talleres y servicios de mantenimiento vehicular.",
        icon: <Code className="w-6 h-6" />,
        image: "/images/templates/successcar.png",
        color: "bg-blue-50 text-blue-600"
    }
];

// 3D Tilt Card component
function TiltCard({ template, index }: { template: typeof templates[0]; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);

    const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
    const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        x.set(px);
        y.set(py);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: 'easeOut',
            }}
            style={{
                perspective: 1000,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-300 border border-gray-100 flex flex-col h-full"
                style={{
                    rotateX: springRotateX,
                    rotateY: springRotateY,
                    transformStyle: 'preserve-3d',
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <div className="h-48 overflow-hidden relative">
                    <Image
                        src={template.image}
                        alt={template.title}
                        width={600}
                        height={400}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                    <div className={`absolute top-4 right-4 w-12 h-12 ${template.color} bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg`}>
                        {template.icon}
                    </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{template.title}</h3>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed flex-1">{template.description}</p>
                    <a href="#" className="inline-flex items-center text-blue-600 font-bold text-sm hover:translate-x-1 transition-transform">
                        Conocer más <span className="ml-2">→</span>
                    </a>
                </div>
            </motion.div>
        </motion.div>
    );
}


export default function Templates() {
    const headerRef = useRef<HTMLDivElement>(null);
    const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

    return (
        <section id="templates" className="py-24 bg-transparent relative overflow-hidden">
            <WavesBackground />
            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    ref={headerRef}
                    className="text-center mb-16 max-w-3xl mx-auto p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 shadow-xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                    <span className="text-blue-600 font-bold text-xs uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Casos de Éxito / Plantillas</span>
                    <h2 className="text-4xl md:text-5xl font-extrabold mt-6 mb-6 text-slate-900">Plantillas Generadas por IA</h2>
                    <p className="text-gray-500 text-lg">Explora la calidad internacional de los diseños que nuestro agente IA construye en segundos para cada tipo de negocio.</p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {templates.map((template, index) => (
                        <TiltCard key={index} template={template} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
