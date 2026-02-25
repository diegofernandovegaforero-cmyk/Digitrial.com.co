'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Triangle, ArrowRight, Sparkles, Lock, MessageCircle, CheckCircle, Loader2 } from 'lucide-react';

type Step = 'form' | 'loading' | 'preview';

const LOADING_MESSAGES = [
    '✏️ Diseñando tu Hero Section...',
    '🎨 Aplicando tu estilo visual...',
    '📦 Creando tarjetas de servicios...',
    '💬 Generando testimonios...',
    '🚀 Optimizando el embudo de ventas...',
    '✨ Dando los últimos toques...',
];

export default function DisenaPage() {
    const [step, setStep] = useState<Step>('form');
    const [loadingMsg, setLoadingMsg] = useState(0);
    const [generatedHtml, setGeneratedHtml] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [unlocked, setUnlocked] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [form, setForm] = useState({
        nombre: '',
        sector: '',
        productos: '',
        estilo: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('loading');
        setError('');

        // Ciclar mensajes de loading
        let idx = 0;
        const interval = setInterval(() => {
            idx = (idx + 1) % LOADING_MESSAGES.length;
            setLoadingMsg(idx);
        }, 1800);

        try {
            const res = await fetch('/api/generar-pagina', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            clearInterval(interval);
            if (data.html) {
                setGeneratedHtml(data.html);
                setStep('preview');
            } else {
                setError('Hubo un error generando tu página. Intenta de nuevo.');
                setStep('form');
            }
        } catch {
            clearInterval(interval);
            setError('Error de conexión. Verifica tu internet e intenta de nuevo.');
            setStep('form');
        }
    };

    const handleWhatsappSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setUnlocked(true);
        // Abrir WhatsApp con el lead
        const msg = encodeURIComponent(
            `🚀 *Nueva solicitud de página web gratis*\n\n*Negocio:* ${form.nombre}\n*Sector:* ${form.sector}\n*Productos:* ${form.productos}\n*Estilo:* ${form.estilo}\n*WhatsApp del cliente:* ${whatsapp}`
        );
        window.open(`https://wa.me/573123299053?text=${msg}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
            {/* Navbar simple */}
            <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
                        <Triangle className="text-white fill-white w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-lg tracking-tight uppercase text-slate-300">
                        DIGI<span className="text-blue-400">TRIAL</span>
                    </span>
                </Link>
                <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                    ← Volver al inicio
                </Link>
            </nav>

            {/* ─── PASO 1: FORMULARIO ─── */}
            {step === 'form' && (
                <main className="max-w-2xl mx-auto px-6 py-16">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            Generado con Inteligencia Artificial
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                            Diseña tu Página Web
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                Gratis en 60 segundos
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-lg mx-auto">
                            Cuéntanos sobre tu negocio y nuestra IA creará una landing page profesional y personalizada para ti.
                        </p>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleGenerate} className="space-y-5">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5 backdrop-blur-sm">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">
                                    🏢 Nombre de tu negocio *
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    placeholder='Ej: "Cafetería El Grano", "Estudio Fotos Lima"'
                                    required
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">
                                    🏷️ Sector / Actividad económica *
                                </label>
                                <input
                                    type="text"
                                    name="sector"
                                    value={form.sector}
                                    onChange={handleChange}
                                    placeholder='Ej: "Gastronomía local", "Fotografía", "Moda y ropa"'
                                    required
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">
                                    ⭐ Productos / Servicios estrella *
                                </label>
                                <textarea
                                    name="productos"
                                    value={form.productos}
                                    onChange={handleChange}
                                    placeholder='Ej: "Café de especialidad, postres artesanales, desayunos ejecutivos"'
                                    required
                                    rows={3}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">
                                    🎨 Estilo visual / Tono de marca *
                                </label>
                                <select
                                    name="estilo"
                                    value={form.estilo}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-800 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                                >
                                    <option value="">Selecciona un estilo...</option>
                                    <option value="Moderno y minimalista">🖤 Moderno y minimalista</option>
                                    <option value="Cálido y rústico">☕ Cálido y rústico</option>
                                    <option value="Profesional y corporativo">💼 Profesional y corporativo</option>
                                    <option value="Dinámico y juvenil">🎯 Dinámico y juvenil</option>
                                    <option value="Elegante y premium">✨ Elegante y premium</option>
                                    <option value="Colorido y creativo">🎨 Colorido y creativo</option>
                                </select>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5"
                        >
                            <Sparkles className="w-5 h-5" />
                            Generar mi Página Web Gratis
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        <p className="text-center text-slate-500 text-xs">
                            🔒 Sin tarjeta de crédito · 100% Gratis · Listo en 60 segundos
                        </p>
                    </form>
                </main>
            )}

            {/* ─── PASO 2: LOADING ─── */}
            {step === 'loading' && (
                <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
                    <div className="relative mb-8">
                        <div className="w-24 h-24 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                        <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Creando tu página web...</h2>
                    <p className="text-blue-300 text-lg font-medium transition-all duration-500">
                        {LOADING_MESSAGES[loadingMsg]}
                    </p>
                    <div className="mt-8 flex gap-2">
                        {LOADING_MESSAGES.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i <= loadingMsg ? 'bg-blue-500 w-8' : 'bg-white/20 w-4'}`}
                            />
                        ))}
                    </div>
                    <p className="mt-6 text-slate-500 text-sm">Esto puede tomar hasta 30 segundos...</p>
                </div>
            )}

            {/* ─── PASO 3: PREVIEW + MODAL ─── */}
            {step === 'preview' && (
                <div className="relative">
                    {/* Iframe con la página generada */}
                    <div className={`relative w-full transition-all duration-700 ${unlocked ? '' : 'overflow-hidden'}`}
                        style={{ height: unlocked ? 'auto' : '80vh' }}>

                        <iframe
                            srcDoc={generatedHtml}
                            className={`w-full transition-all duration-700 ${unlocked ? '' : 'pointer-events-none'}`}
                            style={{
                                height: unlocked ? '100vh' : '160vh',
                                filter: unlocked ? 'none' : 'blur(6px)',
                                transform: unlocked ? 'none' : 'scale(0.85)',
                                transformOrigin: 'top center',
                            }}
                            title="Vista previa de tu página web"
                        />

                        {/* Gradiente de bloqueo */}
                        {!unlocked && (
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900 pointer-events-none" />
                        )}
                    </div>

                    {/* Modal de captura de WhatsApp */}
                    {!unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center px-4 pt-32 pb-8">
                            <div className="bg-slate-900/95 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl backdrop-blur-xl text-center">
                                {/* Emoji WOW */}
                                <div className="text-5xl mb-4">🎉</div>

                                <h2 className="text-2xl font-extrabold mb-2">
                                    ¡Tu página para{' '}
                                    <span className="text-blue-400">{form.nombre}</span>{' '}
                                    quedó increíble!
                                </h2>
                                <p className="text-slate-400 text-sm mb-6">
                                    Ingresa tu número de WhatsApp para desbloquear la vista previa interactiva y recibir el diseño completo en tu teléfono.
                                </p>

                                {/* Beneficios */}
                                <div className="space-y-2 mb-6 text-left">
                                    {[
                                        'Código HTML completo de tu página',
                                        'Asesoría personalizada para tu negocio',
                                        'Presupuesto sin compromiso',
                                    ].map((b) => (
                                        <div key={b} className="flex items-center gap-2 text-sm text-slate-300">
                                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                            {b}
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleWhatsappSubmit} className="space-y-3">
                                    <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                                        <MessageCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                        <input
                                            type="tel"
                                            value={whatsapp}
                                            onChange={(e) => setWhatsapp(e.target.value)}
                                            placeholder="Ej: 3123299053"
                                            required
                                            className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                                    >
                                        <Lock className="w-4 h-4" />
                                        Desbloquear mi página web gratis
                                    </button>
                                </form>

                                <p className="mt-4 text-slate-600 text-xs">
                                    🔒 Solo te contactaremos por WhatsApp. Sin spam.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Banner de éxito tras desbloqueo */}
                    {unlocked && submitted && (
                        <div className="sticky top-0 z-50 bg-green-600 text-white py-3 px-6 flex items-center justify-between shadow-lg">
                            <div className="flex items-center gap-2 font-semibold">
                                <CheckCircle className="w-5 h-5" />
                                ¡Gracias! Tu asesor ya recibió tu solicitud y te contactará pronto por WhatsApp.
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setStep('form'); setUnlocked(false); setSubmitted(false); setForm({ nombre: '', sector: '', productos: '', estilo: '' }); }}
                                    className="text-xs bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full transition"
                                >
                                    Crear otra página
                                </button>
                                <Link href="/" className="text-xs bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full transition">
                                    Ir al inicio
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Iframe completa cuando está desbloqueada */}
                    {unlocked && (
                        <iframe
                            srcDoc={generatedHtml}
                            className="w-full"
                            style={{ height: '100vh', border: 'none' }}
                            title="Tu página web generada"
                        />
                    )}
                </div>
            )}
        </div>
    );
}
