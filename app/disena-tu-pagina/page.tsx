'use client';
import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Triangle, ArrowRight, Sparkles, CheckCircle, Loader2, Mic, MicOff, RefreshCw, Link2, ImagePlus, X } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type Step = 'form' | 'loading' | 'preview';

const LOADING_MESSAGES = [
    'Analizando tu descripción...',
    'Diseñando el Hero Section premium...',
    'Aplicando estilo visual y paleta de colores...',
    'Creando tarjetas de servicios con animaciones...',
    'Seleccionando imágenes profesionales de Unsplash...',
    'Configurando animaciones AOS al scroll...',
    'Integrando Google Fonts premium...',
    'Optimizando el embudo de ventas...',
    'Añadiendo microinteracciones y parallax...',
    'Dando los últimos toques premium...',
];

// ─── IMMERSIVE LOADING SCREEN ─────────────────────────────────────────────────
function ImmersiveLoader({ msgIdx }: { msgIdx: number }) {
    const [percent, setPercent] = useState(0);

    useEffect(() => {
        setPercent(0);
        const checkpoints = [
            { target: 20, step: 2, delay: 80 },
            { target: 70, step: 1, delay: 200 },
            { target: 95, step: 1, delay: 140 },
            { target: 100, step: 1, delay: 60 },
        ];
        let current = 0;
        let cpIdx = 0;
        let timer: ReturnType<typeof setInterval>;

        const runNext = () => {
            if (cpIdx >= checkpoints.length) return;
            const cp = checkpoints[cpIdx];
            timer = setInterval(() => {
                current += cp.step;
                setPercent(Math.min(current, 100));
                if (current >= cp.target) {
                    clearInterval(timer);
                    cpIdx++;
                    setTimeout(runNext, 100);
                }
            }, cp.delay);
        };

        runNext();
        return () => clearInterval(timer);
    }, []);

    const msg = LOADING_MESSAGES[msgIdx % LOADING_MESSAGES.length];

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#09090b]">
            <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute w-[300px] h-[300px] rounded-full bg-purple-600/10 blur-[100px] translate-y-20 pointer-events-none" />

            <div className="relative mb-8">
                <div
                    className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center shadow-2xl"
                    style={{ animation: 'digitrialGlow 2s ease-in-out infinite' }}
                >
                    <Triangle className="text-white fill-white w-10 h-10" />
                </div>
                <div
                    className="absolute -inset-3 rounded-2xl border-2 border-blue-500/30"
                    style={{ animation: 'orbitPulse 2s ease-in-out infinite' }}
                />
            </div>

            <p className="text-slate-400 text-sm font-semibold uppercase tracking-[0.3em] mb-6">
                DIGI<span className="text-blue-400">TRIAL</span>
            </p>

            <div className="text-7xl font-black text-white mb-6" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {percent}<span className="text-blue-400 text-4xl">%</span>
            </div>

            <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-8">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${percent}%`, transition: 'width 0.2s ease' }}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.p
                    key={msg}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className="text-slate-400 text-sm text-center max-w-xs px-6"
                >
                    {msg}
                </motion.p>
            </AnimatePresence>

            <p className="text-slate-600 text-xs mt-6">Esto puede tomar entre 15 y 30 segundos</p>

            <style>{`
                @keyframes digitrialGlow {
                    0%, 100% { box-shadow: 0 0 30px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.1); transform: scale(1); }
                    50%       { box-shadow: 0 0 50px rgba(99,102,241,0.7), 0 0 100px rgba(139,92,246,0.2); transform: scale(1.04); }
                }
                @keyframes orbitPulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50%       { opacity: 0.8; transform: scale(1.06); }
                }
            `}</style>
        </div>
    );
}

function DisenaPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState<Step>('form');
    const [showHero, setShowHero] = useState(true);
    const [heroVisible] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [authUser, setAuthUser] = useState<{ email: string | null; displayName: string | null } | null>(null);

    // Detect auth state + ?form=true param to skip hero
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthUser({ email: user.email, displayName: user.displayName });
                if (searchParams.get('form') === 'true') {
                    setShowHero(false);
                    setFormVisible(true);
                }
            }
        });
        return unsub;
    }, [searchParams]);

    // Hero CTA → go to /login
    const handleStartDesigning = () => {
        router.push('/login?redirect=' + encodeURIComponent('/disena-tu-pagina?form=true'));
    };

    const [loadingMsg, setLoadingMsg] = useState(0);
    const [generatedHtml, setGeneratedHtml] = useState('');
    const [error, setError] = useState('');
    const [cookiesAccepted, setCookiesAccepted] = useState<boolean | null>(null);

    // Audio recording
    const MAX_AUDIO_SEG = 25;
    const MIN_CHARS_PRODUCTOS = 50;
    const MAX_CHARS_PRODUCTOS = 500;
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

    // Image Upload & Drag-and-Drop
    const [imagenesAdjuntas, setImagenesAdjuntas] = useState<{ url: string, file: File }[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
            const newImages = files.map(f => ({ url: URL.createObjectURL(f), file: f }));
            setImagenesAdjuntas(prev => [...prev, ...newImages].slice(0, 3));
        }
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (!audioBlob && e.dataTransfer.files) {
            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            const newImages = files.map(f => ({ url: URL.createObjectURL(f), file: f }));
            setImagenesAdjuntas(prev => [...prev, ...newImages].slice(0, 3));
        }
    };

    const removeImage = (index: number) => {
        setImagenesAdjuntas(prev => {
            const newImgs = [...prev];
            URL.revokeObjectURL(newImgs[index].url);
            newImgs.splice(index, 1);
            return newImgs;
        });
    };

    const getBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const [descripcion, setDescripcion] = useState('');
    const productosValido = (descripcion.length >= MIN_CHARS_PRODUCTOS && descripcion.length <= MAX_CHARS_PRODUCTOS) || audioBlob !== null;

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('loading');
        setError('');
        let idx = 0;
        const interval = setInterval(() => { idx = (idx + 1) % LOADING_MESSAGES.length; setLoadingMsg(idx); }, 2200);
        try {
            const base64Images = await Promise.all(imagenesAdjuntas.map(img => getBase64(img.file)));
            const res = await fetch('/api/generar-pagina', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    descripcion,
                    imagenes_base64: base64Images,
                    email: authUser?.email,
                    nombre_contacto: authUser?.displayName || ''
                }),
            });

            clearInterval(interval);

            if (res.ok && res.body) {
                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let htmlTemp = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    htmlTemp += decoder.decode(value, { stream: true });
                    const cleanHtml = htmlTemp.replace(/```html/gi, '').replace(/```/g, '');
                    setGeneratedHtml(cleanHtml);
                }

                // Mostrar la vista preliminar SOLO cuando la IA haya terminado de armar toda la web
                setStep('preview');
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.error || 'Hubo un error generando tu página. Intenta de nuevo.');
                setStep('form');
            }
        } catch {
            clearInterval(interval);
            setError('Error de conexión. Verifica tu internet e intenta de nuevo.');
            setStep('form');
        }
    };

    // Email del usuario autenticado para el enlace al editor
    const userEmail = authUser?.email || '';
    const [editPanelOpen, setEditPanelOpen] = useState(false);
    const [editInstruction, setEditInstruction] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const handleEditRequest = async () => {
        if (!editInstruction.trim() || !userEmail) return;
        setIsEditing(true);
        // Lógica futura para conectar directamente aquí con /api/editar-pagina
        // O redirigir al editor con la instrucción. Por ahora redirige al editor pro:
        router.push(`/editor?email=${encodeURIComponent(userEmail)}&instruccion=${encodeURIComponent(editInstruction)}`);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white overflow-hidden relative">
            {/* Navbar - Solo visible si no estamos en preview */}
            <AnimatePresence>
                {step !== 'preview' && (
                    <motion.nav
                        initial={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-center justify-between px-6 py-4 border-b border-white/10 relative z-50"
                    >
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
                                <Triangle className="text-white fill-white w-4 h-4" />
                            </div>
                            <span className="font-extrabold text-lg tracking-tight uppercase text-slate-300">
                                DIGI<span className="text-blue-400">TRIAL</span>
                            </span>
                        </Link>
                        <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">← Volver al inicio</Link>
                    </motion.nav>
                )}
            </AnimatePresence>

            {/* ─── HERO SECTION ─── */}
            {showHero && step === 'form' && (
                <section
                    className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden"
                    style={{
                        opacity: heroVisible ? 1 : 0,
                        transform: heroVisible ? 'translateY(0)' : 'translateY(-40px)',
                        transition: 'opacity 0.5s ease, transform 0.5s ease',
                    }}
                >
                    <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                        <div className="w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[130px]" />
                        <div className="w-[35vw] h-[35vw] bg-blue-600/15 rounded-full blur-[100px] absolute translate-y-24" />
                    </div>

                    <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
                        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-sm sm:text-base text-gray-300">
                            <span className="font-semibold text-white">Excelente</span>
                            <span className="text-green-400 text-xl tracking-widest leading-none">★★★★★</span>
                            <span className="opacity-70">La agencia digital preferida en Colombia</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                            Diseña tu web{' '}
                            <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400">
                                hoy mismo
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
                            Crea la página web profesional para tu negocio simplemente
                            describiendo tu idea. La IA de Digitrial la diseña en tiempo real,
                            sin código, lista para atraer clientes.
                        </p>

                        <div className="flex flex-col items-center">
                            <button
                                onClick={handleStartDesigning}
                                className="bg-white text-black font-bold text-lg px-10 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 shadow-[0_0_50px_rgba(255,255,255,0.15)] flex items-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                Empezar a diseñar gratis
                            </button>
                            <span className="text-sm text-gray-500 mt-4 font-medium tracking-wide">
                                No necesitas tarjeta de crédito · Obtienes 15 créditos de regalo
                            </span>
                        </div>

                        <div className="mt-16 flex flex-col items-center gap-2 opacity-40">
                            <span className="text-xs text-gray-500 uppercase tracking-widest">Generado con IA</span>
                            <div className="w-px h-8 bg-gradient-to-b from-gray-500 to-transparent" />
                        </div>
                    </div>
                </section>
            )}

            {/* ─── PASO 1: FORMULARIO ─── */}
            {step === 'form' && (
                <main
                    className="max-w-2xl mx-auto px-6 py-16"
                    style={{
                        display: showHero ? 'none' : undefined,
                        opacity: formVisible ? 1 : 0,
                        transform: formVisible ? 'translateY(0)' : 'translateY(40px)',
                        transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
                    }}
                >
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            Generado con Inteligencia Artificial
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                            Describe tu idea
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                                y la IA hará el resto
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-lg mx-auto">
                            Cuéntanos tu idea en al menos 50 caracteres. Cuanto más detalle des, mejor será tu página.
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
                                    <span className="ml-2 text-xs font-normal text-slate-500">mín. {MIN_CHARS_PRODUCTOS} · máx. {MAX_CHARS_PRODUCTOS} caracteres</span>
                                </label>

                                <div
                                    className={`relative rounded-xl overflow-hidden border-2 transition-colors ${isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-transparent'
                                        }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <textarea
                                        name="descripcion"
                                        value={audioBlob ? '' : descripcion}
                                        onChange={e => !audioBlob && setDescripcion(e.target.value.slice(0, MAX_CHARS_PRODUCTOS))}
                                        disabled={!!audioBlob}
                                        rows={8}
                                        maxLength={MAX_CHARS_PRODUCTOS}
                                        placeholder={audioBlob ? '' : `Cuéntanos tu idea, o arrastra imágenes aquí (ej: capturas de pantalla) para diseñar... (mín. ${MIN_CHARS_PRODUCTOS} caracteres)`}
                                        className={`w-full bg-white/10 border rounded-xl px-4 py-3 pb-16 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition resize-none text-sm ${audioBlob
                                            ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/20'
                                            : 'border-white/20 focus:border-blue-500 focus:ring-blue-500/20'
                                            } ${isDragging ? 'opacity-50' : ''}`}
                                    />

                                    {/* Preview Imágenes Adjuntas */}
                                    {imagenesAdjuntas.length > 0 && !audioBlob && (
                                        <div className="absolute bottom-12 left-3 right-3 flex gap-2 overflow-x-auto pb-1">
                                            {imagenesAdjuntas.map((img, idx) => (
                                                <div key={idx} className="relative w-12 h-12 rounded-lg border border-white/20 overflow-hidden flex-shrink-0 group">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={img.url} alt="Referencia" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X className="w-4 h-4 text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {audioBlob && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-green-900/30 border border-green-500/40">
                                            <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                                                <CheckCircle className="w-5 h-5" />
                                                Audio grabado ({segundosGrabacion}s) ✅
                                            </div>
                                            <button type="button" onClick={limpiarAudio}
                                                className="mt-2 text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1">
                                                <RefreshCw className="w-3 h-3" /> Eliminar y escribir
                                            </button>
                                        </div>
                                    )}

                                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
                                        {!audioBlob && (
                                            <span className={`text-xs pointer-events-none ${descripcion.length >= MIN_CHARS_PRODUCTOS ? 'text-green-400 font-semibold' : 'text-slate-600'}`}>
                                                {descripcion.length >= MIN_CHARS_PRODUCTOS ? '✅' : ''} {descripcion.length}/{MAX_CHARS_PRODUCTOS}
                                            </span>
                                        )}
                                        {audioBlob && <span />}

                                        <div className="flex gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handleImageSelect}
                                                disabled={!!audioBlob || imagenesAdjuntas.length >= 3}
                                            />
                                            <button type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={!!audioBlob || imagenesAdjuntas.length >= 3}
                                                title="Adjuntar capturas de pantalla o referencias (Máx. 3)"
                                                className={`pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${audioBlob || imagenesAdjuntas.length >= 3
                                                    ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                                                    : 'bg-white/10 hover:bg-blue-600/60 text-slate-400 hover:text-white'
                                                    }`}>
                                                <ImagePlus className="w-3.5 h-3.5" /> Adjuntar
                                            </button>

                                            <button type="button"
                                                onClick={grabando ? detenerGrabacion : iniciarGrabacion}
                                                disabled={!!audioBlob || isDragging}
                                                title={grabando ? 'Detener grabación' : `Grabar audio (hasta ${MAX_AUDIO_SEG}s)`}
                                                className={`pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${grabando
                                                    ? 'bg-red-500 text-white animate-pulse'
                                                    : audioBlob
                                                        ? 'bg-green-600/40 text-green-300 cursor-not-allowed'
                                                        : 'bg-white/10 hover:bg-blue-600/60 text-slate-400 hover:text-white'
                                                    }`}>
                                                {grabando ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                                                {grabando ? `${segundosGrabacion}s` : '🎤 Audio'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Barra de progreso de caracteres */}
                                {!audioBlob && (
                                    <div className="mt-1.5 h-1 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${descripcion.length >= MIN_CHARS_PRODUCTOS ? 'bg-green-500' : 'bg-blue-500'}`}
                                            style={{ width: `${Math.min((descripcion.length / MAX_CHARS_PRODUCTOS) * 100, 100)}%` }}
                                        />
                                    </div>
                                )}

                                {grabando && (
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                            <span className="text-red-400 text-xs font-semibold">Grabando... {segundosGrabacion}s / {MAX_AUDIO_SEG}s</span>
                                        </div>
                                        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${(segundosGrabacion / MAX_AUDIO_SEG) * 100}%` }} />
                                        </div>
                                    </div>
                                )}

                                {/* ── URL HINT NOTE ── */}
                                <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 border-t border-white/5 pt-3">
                                    <Link2 className="w-3.5 h-3.5 flex-shrink-0 text-slate-600 mt-0.5" />
                                    <span>
                                        ¿Tienes una página de referencia? Inclúyela directamente en tu descripción
                                        (ej: <em className="text-slate-400">&quot;…similar a apple.com&quot;</em>) y la IA se inspirará en ella.
                                    </span>
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

            {/* ─── PASO 2: LOADING INMERSIVO ─── */}
            {step === 'loading' && (
                <ImmersiveLoader msgIdx={loadingMsg} />
            )}

            {/* ─── PASO 3: PREVIEW ─── */}
            {step === 'preview' && (
                <main className="h-screen w-screen relative bg-white">
                    {/* Iframe ocupando el 100% de la pantalla */}
                    <iframe
                        srcDoc={generatedHtml}
                        className="w-full h-full border-none"
                        title="Tu página web generada"
                    />

                    {/* Botón Flotante para abrir panel lateral */}
                    <motion.button
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: editPanelOpen ? 100 : 0 }}
                        onClick={() => setEditPanelOpen(true)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-600/90 hover:bg-blue-600 text-white p-3 md:p-4 rounded-l-2xl shadow-[-10px_0_30px_rgba(37,99,235,0.3)] backdrop-blur-md border border-r-0 border-white/20 transition-all z-40 group flex items-center gap-2"
                    >
                        <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                        <span className="font-bold text-sm tracking-wide mr-1 shadow-black drop-shadow-md">Editar Web</span>
                    </motion.button>

                    {/* Panel flotante de Edición */}
                    <AnimatePresence>
                        {editPanelOpen && (
                            <>
                                {/* Overlay oscuro al abrir el panel */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
                                    onClick={() => setEditPanelOpen(false)}
                                />

                                {/* Drawer lateral derecho */}
                                <motion.div
                                    initial={{ x: '100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '100%' }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="absolute right-0 top-0 bottom-0 w-full md:w-[400px] bg-slate-900 border-l border-white/10 shadow-2xl z-50 flex flex-col"
                                >
                                    <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-800/50">
                                        <div className="flex items-center gap-2 text-white">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                <Triangle className="w-4 h-4 fill-white text-white" />
                                            </div>
                                            <h3 className="font-bold text-lg">Modificar Diseño</h3>
                                        </div>
                                        <button
                                            onClick={() => setEditPanelOpen(false)}
                                            className="text-slate-400 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="p-6 flex-1 overflow-y-auto">
                                        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                                            ¿Qué te gustaría cambiar? Dale instrucciones a nuestra IA para ajustar colores, tipografías, reordenar secciones o cambiar estilos.
                                        </p>

                                        <div className="space-y-4">
                                            <div className="bg-slate-950/50 rounded-xl border border-white/10 p-4">
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                                                    ✨ Instrucciones de edición
                                                </label>
                                                <textarea
                                                    value={editInstruction}
                                                    onChange={e => setEditInstruction(e.target.value)}
                                                    placeholder="Ej: Haz que el fondo sea claro en lugar de oscuro, cambia las imágenes por ilustraciones 3D y usa rojo como color principal..."
                                                    className="w-full bg-transparent text-sm text-white border-0 p-0 focus:ring-0 resize-none min-h-[120px] placeholder:text-slate-600"
                                                />
                                            </div>

                                            <button
                                                onClick={handleEditRequest}
                                                disabled={!editInstruction.trim() || isEditing || !userEmail}
                                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                                            >
                                                {isEditing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                                {isEditing ? 'Procesando cambios...' : (!userEmail ? 'Inicia sesión para editar' : 'Aplicar Modificaciones')}
                                            </button>

                                            {!userEmail && (
                                                <p className="text-xs text-amber-400 text-center flex items-center justify-center gap-1 mt-2">
                                                    Debes tener una cuenta activa para guardar ediciones de IA.
                                                </p>
                                            )}

                                            <div className="mt-8">
                                                <p className="text-xs text-slate-500 text-center mb-3">Otras opciones</p>
                                                <a
                                                    href="https://wa.me/573123299053"
                                                    target="_blank"
                                                    className="w-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                                                >
                                                    📱 Hablar con un asesor real
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
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
                                Al hacer clic en <strong className="text-white">&quot;Aceptar&quot;</strong>, consientes el uso de cookies.
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

export default function DisenaPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
            <DisenaPageContent />
        </Suspense>
    );
}
