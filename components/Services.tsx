'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useInView } from 'framer-motion';
import { Code, Layout, Filter, Smartphone, Users, Video } from 'lucide-react';

const services = [
    {
        title: "Desarrollo Web Premium",
        description: "Sitios web ultrarrápidos y estéticamente impactantes que convierten visitantes en clientes.",
        icon: <Code className="w-6 h-6" />,
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
        color: "bg-blue-50 text-blue-600"
    },
    {
        title: "Landing Pages de Alta Conversión",
        description: "Páginas diseñadas psicológicamente para maximizar tus ventas y captación de leads.",
        icon: <Layout className="w-6 h-6" />,
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
        color: "bg-purple-50 text-purple-600"
    },
    {
        title: "Embudos de Venta (Funnels)",
        description: "Sistemas automatizados que guían a tus prospectos hasta la compra 24/7.",
        icon: <Filter className="w-6 h-6" />,
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
        color: "bg-indigo-50 text-indigo-600"
    },
    {
        title: "Estrategia Social Media",
        description: "No solo publicamos, construimos comunidades leales y amplificamos tu voz de marca.",
        icon: <Users className="w-6 h-6" />,
        image: "/images/social-media-logos.jpg",
        color: "bg-cyan-50 text-cyan-600"
    },
    {
        title: "Talento Humano & SST",
        description: "Gestión integral del capital humano y seguridad laboral adaptada a la era moderna.",
        icon: <Smartphone className="w-6 h-6" />,
        image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80",
        color: "bg-green-50 text-green-600"
    },
    {
        title: "Producción Audiovisual",
        description: "Contenido visual de calidad cinematográfica para posicionar tu marca en el top.",
        icon: <Video className="w-6 h-6" />,
        image: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=600&q=80",
        color: "bg-orange-50 text-orange-600"
    }
];

// 3D Tilt Card component
function TiltCard({ service, index }: { service: typeof services[0]; index: number }) {
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
                        src={service.image}
                        alt={service.title}
                        width={600}
                        height={400}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                    <div className={`absolute top-4 right-4 w-12 h-12 ${service.color} bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg`}>
                        {service.icon}
                    </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed flex-1">{service.description}</p>
                    <a href="#" className="inline-flex items-center text-blue-600 font-bold text-sm hover:translate-x-1 transition-transform">
                        Conocer más <span className="ml-2">→</span>
                    </a>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function Services() {
    const headerRef = useRef<HTMLDivElement>(null);
    const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

    return (
        <section id="services" className="py-24 bg-white/70">
            <div className="container mx-auto px-6">
                <motion.div
                    ref={headerRef}
                    className="text-center mb-16 max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                    <span className="text-blue-600 font-bold text-xs uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Nuestras Soluciones</span>
                    <h2 className="text-4xl md:text-5xl font-extrabold mt-6 mb-6 text-slate-900">Todo lo que necesitas para escalar</h2>
                    <p className="text-gray-500 text-lg">Ecosistema integral de servicios diseñados para potenciar cada aspecto de tu presencia digital con resultados medibles.</p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <TiltCard key={index} service={service} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
