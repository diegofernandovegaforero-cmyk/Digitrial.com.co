'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Triangle, ArrowRight, Sparkles, Mail, CheckCircle, Loader2, Mic, MicOff, RefreshCw } from 'lucide-react';

type Step = 'form' | 'loading' | 'preview';

const LOADING_MESSAGES = [
    '✏️ Diseñando tu Hero Section...',
    '🎨 Aplicando tu estilo visual...',
    '📦 Creando tarjetas de servicios...',
    '🖼️ Seleccionando imágenes profesionales...',
    '🚀 Optimizando el embudo de ventas...',
    '✨ Dando los últimos toques...',
];

export default function DisenaPage() {
    const [step, setStep] = useState<Step>('form');
    const [loadingMsg, setLoadingMsg] = useState(0);
    const [generatedHtml, setGeneratedHtml] = useState('');
    const [unlocked, setUnlocked] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [cookiesAccepted, setCookiesAccepted] = useState<boolean | null>(null);

    // Lead capture state
    const [nombreContacto, setNombreContacto] = useState('');
    const [emailContacto, setEmailContacto] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Audio recording for productos field
    const MAX_AUDIO_SEG = 45;
    const MIN_CHARS_PRODUCTOS = 500;
    const [grabando, setGrabando] = useState(false);
    const [segundosGrabacion, setSegundosGrabacion] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const iniciarGrabacion = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(stream);
            mediaRecorderRef.current = mr;
            audioChunksRef.current = [];
            mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mr.onstop = () => {
                setAudioBlob(new Blob(audioChunksRef.current, { type: 'audio/webm' }));
                stream.getTracks().forEach(t => t.stop());
            };
            mr.start();
            setGrabando(true);
            setSegundosGrabacion(0);
            audioIntervalRef.current = setInterval(() => {
                setSegundosGrabacion(prev => {
                    if (prev >= MAX_AUDIO_SEG - 1) { detenerGrabacion(); return MAX_AUDIO_SEG; }
                    return prev + 1;
                });
            }, 1000);
        } catch { setError('No se pudo acceder al micrófono. Verifica los permisos.'); }
    }, []);

    const detenerGrabacion = useCallback(() => {
        if (mediaRecorderRef.current && grabando) {
            mediaRecorderRef.current.stop();
            setGrabando(false);
            if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
        }
    }, [grabando]);

    const limpiarAudio = () => { setAudioBlob(null); setSegundosGrabacion(0); };

    useEffect(() => {
        const saved = localStorage.getItem('digitrial_cookies');
        setCookiesAccepted(saved === 'accepted' ? true : saved === 'rejected' ? false : null);
    }, []);

    const acceptCookies = () => { localStorage.setItem('digitrial_cookies', 'accepted'); setCookiesAccepted(true); };
    const rejectCookies = () => { localStorage.setItem('digitrial_cookies', 'rejected'); setCookiesAccepted(false); };

    // Form state
    const [descripcion, setDescripcion] = useState('');

    // Formulario válido cuando: descripcion ≥ 500 chars O hay audio grabado
    const productosValido = descripcion.length >= MIN_CHARS_PRODUCTOS || audioBlob !== null;

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('loading');
        setError('');
        let idx = 0;
        const interval = setInterval(() => { idx = (idx + 1) % LOADING_MESSAGES.length; setLoadingMsg(idx); }, 1800);
        try {
            const res = await fetch('/api/generar-pagina', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ descripcion }),
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

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitting(true);
        try {
            // Guardar en Firebase con email + código generado
            await fetch('/api/generar-pagina', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    descripcion,
                    nombre_contacto: nombreContacto,
                    email: emailContacto,
                }),
            });
            setSubmitted(true);
            setUnlocked(true);
        } catch {
            setSubmitError('Error enviando. Intenta de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
                        <Triangle className="text-white fill-white w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-lg tracking-tight uppercase text-slate-300">
                        DIGI<span className="text-blue-400">TRIAL</span>
                    </span>
                </Link>
                <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">← Volver al inicio</Link>
            </nav>

            {/* ─── PASO 1: FORMULARIO ─── */}
            {step === 'form' && (
                <main className="max-w-2xl mx-auto px-6 py-16">
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
                            Cuéntanos sobre tu negocio y nuestra IA creará una landing page profesional optimizada para ventas.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleGenerate} className="space-y-5">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">
                                    💡 Describe tu idea
                                    <span className="ml-2 text-xs font-normal text-slate-500">mín. 500 caracteres o audio de 45s</span>
                                </label>

                                {/* Textarea con contador */}
                                {!audioBlob && (
                                    <>
                                        <textarea
                                            name="descripcion"
                                            value={descripcion}
                                            onChange={e => setDescripcion(e.target.value)}
                                            rows={7}
                                            placeholder='Cuéntanos todo sobre tu idea: qué vendes, a quién va dirigido, qué te hace especial, precios, zona de atención, nombres propios... Entre más detalle des, mejor será tu página. (Mínimo 500 caracteres)'
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none text-sm"
                                        />
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className={descripcion.length >= MIN_CHARS_PRODUCTOS ? 'text-green-400 font-semibold' : 'text-slate-500'}>
                                                    {descripcion.length >= MIN_CHARS_PRODUCTOS ? '✅ ¡Suficiente detalle!' : `${descripcion.length} / ${MIN_CHARS_PRODUCTOS} caracteres mínimos`}
                                                </span>
                                                {descripcion.length < MIN_CHARS_PRODUCTOS && (
                                                    <span className="text-slate-600">{MIN_CHARS_PRODUCTOS - descripcion.length} restantes</span>
                                                )}
                                            </div>
                                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${descripcion.length >= MIN_CHARS_PRODUCTOS ? 'bg-green-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${Math.min((descripcion.length / MIN_CHARS_PRODUCTOS) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Separador OR */}
                                {!audioBlob && (
                                    <div className="flex items-center gap-3 my-3">
                                        <div className="flex-1 h-px bg-white/10" />
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">o graba audio</span>
                                        <div className="flex-1 h-px bg-white/10" />
                                    </div>
                                )}

                                {/* Grabación de audio */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    {!audioBlob ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                {grabando ? (
                                                    <>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                                                            <span className="text-red-400 font-bold text-sm">Grabando... {segundosGrabacion}s / {MAX_AUDIO_SEG}s</span>
                                                        </div>
                                                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                            <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${(segundosGrabacion / MAX_AUDIO_SEG) * 100}%` }} />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p className="text-slate-400 text-sm">🎤 Graba hasta <strong>45 segundos</strong> describiendo tu negocio</p>
                                                )}
                                            </div>
                                            <button type="button"
                                                onClick={grabando ? detenerGrabacion : iniciarGrabacion}
                                                className={`ml-4 p-3 rounded-full transition-colors ${grabando ? 'bg-red-500 hover:bg-red-400' : 'bg-blue-600 hover:bg-blue-500'}`}>
                                                {grabando ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                                                <CheckCircle className="w-5 h-5" />
                                                Audio listo ({segundosGrabacion}s) — en lugar del texto ✅
                                            </div>
                                            <button type="button" onClick={limpiarAudio}
                                                className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 ml-3">
                                                <RefreshCw className="w-3 h-3" /> Regrabar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button type="submit"
                            disabled={!productosValido}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 text-lg">
                            <Sparkles className="w-5 h-5" />
                            {productosValido ? 'Generar mi Página Web con IA' : `Faltan ${MIN_CHARS_PRODUCTOS - descripcion.length} caracteres...`}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <p className="text-center text-xs text-slate-500">✅ 100% gratuito · Sin registro previo · Lista en segundos</p>
                    </form>
                </main>
            )}

            {/* ─── PASO 2: LOADING ─── */}
            {step === 'loading' && (
                <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
                    <div className="relative mb-10">
                        <div className="w-24 h-24 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-3">La IA está construyendo tu página...</h2>
                    <p className="text-blue-300 text-lg animate-pulse">{LOADING_MESSAGES[loadingMsg]}</p>
                    <p className="text-slate-500 text-sm mt-4">Esto puede tomar entre 15 y 30 segundos</p>
                </main>
            )}

            {/* ─── PASO 3: PREVIEW ─── */}
            {step === 'preview' && (
                <main className="relative">
                    {/* Preview del diseño */}
                    <div className="relative">
                        <iframe
                            srcDoc={generatedHtml}
                            className="w-full border-none transition-all duration-500"
                            style={{
                                height: '100vh',
                                filter: unlocked ? 'none' : 'blur(6px)',
                                pointerEvents: unlocked ? 'auto' : 'none',
                            }}
                            title="Tu página web generada"
                        />

                        {/* MURO DE LEADS - Modal Email */}
                        {!unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
                                <div className="bg-slate-800/95 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
                                    {/* Ícono animado */}
                                    <div className="text-6xl mb-4 animate-bounce">🚀</div>

                                    <h2 className="text-2xl font-extrabold mb-2 text-white">
                                        ¡Tu diseño está listo y optimizado!
                                    </h2>
                                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                        Hemos creado una estructura de alta conversión para tu negocio. Ingresa tu mejor correo electrónico para <strong className="text-white">enviarte el código fuente</strong>, desbloquear el editor con tus <strong className="text-blue-400">15 créditos gratuitos</strong> y guardar tu proyecto.
                                    </p>

                                    {!submitted ? (
                                        <form onSubmit={handleEmailSubmit} className="space-y-3 text-left">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                                    👤 Nombre *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={nombreContacto}
                                                    onChange={e => setNombreContacto(e.target.value)}
                                                    placeholder="Ej: Carlos Rodríguez"
                                                    required
                                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                                    📧 Correo electrónico *
                                                </label>
                                                <input
                                                    type="email"
                                                    value={emailContacto}
                                                    onChange={e => setEmailContacto(e.target.value)}
                                                    placeholder="Ej: carlos@minegocio.com"
                                                    required
                                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-sm"
                                                />
                                            </div>

                                            {submitError && (
                                                <p className="text-red-400 text-xs">{submitError}</p>
                                            )}

                                            <button type="submit" disabled={submitting}
                                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg mt-2 text-sm">
                                                {submitting ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                                                ) : (
                                                    <><Mail className="w-4 h-4" /> 📧 Enviarme mi diseño ahora</>
                                                )}
                                            </button>
                                            <p className="text-center text-xs text-slate-600 mt-2">
                                                🔒 Sin spam. Tu información es privada y segura.
                                            </p>
                                        </form>
                                    ) : (
                                        <div className="text-center py-4">
                                            <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-white mb-2">¡Revisa tu correo, {nombreContacto.split(' ')[0]}!</h3>
                                            <p className="text-slate-400 text-sm mb-4">
                                                Te hemos enviado el diseño a <strong className="text-blue-300">{emailContacto}</strong>. Incluye el link para acceder al editor con tus 15 créditos.
                                            </p>
                                            <Link href={`/editor?email=${encodeURIComponent(emailContacto)}`}
                                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
                                                <Lock className="w-4 h-4" />
                                                Acceder al editor ahora →
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Barra de acción post-unlock */}
                    {unlocked && (
                        <div className="sticky bottom-0 bg-slate-900/95 border-t border-white/10 backdrop-blur-xl py-4 px-6 flex items-center justify-between gap-4">
                            <div>
                                <p className="font-bold text-white text-sm">¡Tu diseño está desbloqueado! 🎉</p>
                                <p className="text-slate-400 text-xs">Edítalo con IA o habla con un asesor para llevarlo a producción.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href={`/editor?email=${encodeURIComponent(emailContacto)}`}
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap">
                                    ✏️ Editar con IA
                                </Link>
                                <a href="https://wa.me/573123299053" target="_blank"
                                    className="bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap">
                                    📱 Asesor
                                </a>
                            </div>
                        </div>
                    )}
                </main>
            )}

            {/* ─── BANNER DE COOKIES ─── */}
            {cookiesAccepted === null && (
                <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
                    <div className="max-w-4xl mx-auto bg-slate-800/95 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-white mb-1">🍪 Política de Cookies</p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Usamos cookies para mejorar tu experiencia y personalizar el contenido.
                                Al hacer clic en <strong className="text-white">"Aceptar"</strong>, consientes el uso de cookies.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <button onClick={rejectCookies} className="text-xs text-slate-400 hover:text-white border border-white/20 hover:border-white/40 px-4 py-2 rounded-xl transition-colors">
                                Rechazar
                            </button>
                            <button onClick={acceptCookies} className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-xl transition-colors shadow-lg shadow-blue-600/30">
                                Aceptar cookies
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
