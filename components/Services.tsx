'use client';
import Image from 'next/image';
import { Code, Layout, Funnel, Smartphone, Users, Video } from 'lucide-react';

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
        icon: <Funnel className="w-6 h-6" />,
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
        color: "bg-indigo-50 text-indigo-600"
    },
    {
        title: "Estrategia Social Media",
        description: "No solo publicamos, construimos comunidades leales y amplificamos tu voz de marca.",
        icon: <Users className="w-6 h-6" />,
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80",
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

export default function Services() {
    return (
        <section id="services" className="py-24 bg-gray-50/50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <span className="text-blue-600 font-bold text-xs uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Nuestras Soluciones</span>
                    <h2 className="text-4xl md:text-5xl font-extrabold mt-6 mb-6 text-slate-900">Todo lo que necesitas para escalar</h2>
                    <p className="text-gray-500 text-lg">Ecosistema integral de servicios diseñados para potenciar cada aspecto de tu presencia digital con resultados medibles.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
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
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
