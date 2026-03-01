'use client';
import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Triangle, Sparkles, Mic, MicOff, Send, AlertCircle, CheckCircle, Loader2, RefreshCw, Zap, Mail, History, Eye, Code } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

const CREDITOS_POR_EDICION = 3;
const MAX_AUDIO_SEGUNDOS = 45;
const MAX_TEXTO_CHARS = 500;

// Sanitizar email para usarlo como Firestore doc ID (igual que en el backend)
const emailToDocId = (email: string) =>
    email.toLowerCase().trim().replace(/[.#$[\]]/g, '_');

function EditorContent() {
    const searchParams = useSearchParams();
    const emailFromUrl = searchParams.get('email') || '';

    const [email, setEmail] = useState(emailFromUrl);
    const [identificado, setIdentificado] = useState(!!emailFromUrl);
    const [userData, setUserData] = useState<{
        nombre_negocio: string;
        nombre_contacto: string;
        creditos_restantes: number;
        codigo_actual: string;
        historial_disenos?: { id: string; codigo_actual: string; descripcion: string; fecha: string }[];
    } | null>(null);
    const [cargando, setCargando] = useState(!!emailFromUrl);
    const [error, setError] = useState('');

    // Pestañas
    const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');
    const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);

    // Editor state
    const [instruccion, setInstruccion] = useState('');
    const [editando, setEditando] = useState(false);
    const [exito, setExito] = useState('');
    const [transcripcion, setTranscripcion] = useState('');

    // Audio recording
    const [grabando, setGrabando] = useState(false);
    const [segundosGrabacion, setSegundosGrabacion] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Modal de Bienvenida e Instrucciones
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [logoLoading, setLogoLoading] = useState(false);
    const hasShownModalRef = useRef(false);

    // Listener de Firestore en tiempo real
    useEffect(() => {
        if (!identificado || !email) return;
        const docId = emailToDocId(email);
        const docRef = doc(db, 'usuarios_leads', docId);
        setCargando(true);

        const unsubscribe = onSnapshot(docRef, async (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setUserData({
                    nombre_negocio: data.nombre_negocio || data.nombre || 'Tu negocio',
                    nombre_contacto: data.nombre_contacto || '',
                    creditos_restantes: data.creditos_restantes ?? 0,
                    codigo_actual: data.codigo_actual || '',
                    historial_disenos: data.historial_disenos || [],
                });
                setError('');
                setCargando(false);
            } else {
                // Compatibilidad hacia atrás: buscar por campo 'email' si el ID no coincide
                import('firebase/firestore').then(({ collection, query, where, getDocs }) => {
                    const q = query(collection(db, 'usuarios_leads'), where('email', '==', email.toLowerCase().trim()));
                    getDocs(q).then((querySnapshot) => {
                        if (!querySnapshot.empty) {
                            const data = querySnapshot.docs[0].data();
                            setUserData({
                                nombre_negocio: data.nombre_negocio || data.nombre || 'Tu negocio',
                                nombre_contacto: data.nombre_contacto || '',
                                creditos_restantes: data.creditos_restantes ?? 0,
                                codigo_actual: data.codigo_actual || '',
                                historial_disenos: data.historial_disenos || [],
                            });
                            setError('');
                        } else {
                            setError('No encontramos tu cuenta. Primero genera tu página web.');
                        }
                        setCargando(false);
                    }).catch(err => {
                        console.error('Error buscando doc antiguo:', err);
                        setError('No encontramos tu cuenta. Primero genera tu página web.');
                        setCargando(false);
                    });
                });
            }
        }, (err) => {
            console.error(err);
            setError('Error conectando con Firebase.');
            setCargando(false);
        });

        return () => unsubscribe();
    }, [identificado, email]);

    // Mostrar modal la primera vez que carga un diseño
    useEffect(() => {
        if (userData?.codigo_actual && !hasShownModalRef.current) {
            hasShownModalRef.current = true;
            setShowWelcomeModal(true);
            setLogoLoading(true);

            // Extraer logo nativo directamente del HTML generado
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(userData.codigo_actual, 'text/html');
                // Buscar imágenes en el header/nav, o que digan 'logo'
                let logoImg = doc.querySelector('header img, nav img, img[alt*="logo" i], img[class*="logo" i], img[id*="logo" i]');
                if (!logoImg) {
                    // Fallback a cualquier imagen si no se encuentra un logo explícito
                    logoImg = doc.querySelector('img');
                }
                const extractedUrl = logoImg ? logoImg.getAttribute('src') : null;

                if (extractedUrl) {
                    setLogoUrl(extractedUrl);
                }
            } catch (err) {
                console.error('Error extrayendo logo del DOM:', err);
            } finally {
                setLogoLoading(false);
            }
        }
    }, [userData?.codigo_actual]);

    // Listener para recibir los cambios editados nativamente desde el Iframe
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.data?.type === 'SAVE_HTML' && event.data?.html && email) {
                try {
                    const docId = emailToDocId(email);
                    const docRef = doc(db, 'usuarios_leads', docId);
                    // Actualizar silenciosamente el código en Firebase sin gastar créditos
                    await updateDoc(docRef, { codigo_actual: event.data.html });
                    setExito('Texto modificado nativamente guardado con éxito.');
                    setTimeout(() => setExito(''), 3000);
                } catch (err) {
                    console.error('Error guardando HTML editado nativamente:', err);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [email]);

    const handleIdentificar = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setIdentificado(true);
    };

    // ── Grabación de audio ──
    const iniciarGrabacion = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };
            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(t => t.stop());
            };

            mediaRecorder.start();
            setGrabando(true);
            setSegundosGrabacion(0);

            audioIntervalRef.current = setInterval(() => {
                setSegundosGrabacion(prev => {
                    if (prev >= MAX_AUDIO_SEGUNDOS - 1) {
                        detenerGrabacion();
                        return MAX_AUDIO_SEGUNDOS;
                    }
                    return prev + 1;
                });
            }, 1000);
        } catch {
            setError('No se pudo acceder al micrófono. Verifica los permisos.');
        }
    }, []);

    const detenerGrabacion = useCallback(() => {
        if (mediaRecorderRef.current && grabando) {
            mediaRecorderRef.current.stop();
            setGrabando(false);
            if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
        }
    }, [grabando]);

    const limpiarAudio = () => {
        setAudioBlob(null);
        setSegundosGrabacion(0);
        setTranscripcion('');
    };

    // ── Enviar edición ──
    const handleEditar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!instruccion.trim() && !audioBlob) {
            setError('Escribe una instrucción o graba un audio.');
            return;
        }
        if ((userData?.creditos_restantes ?? 0) < CREDITOS_POR_EDICION) return;

        setEditando(true);
        setError('');
        setExito('');

        let audio_base64 = '';
        if (audioBlob) {
            const arrayBuffer = await audioBlob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            let binary = '';
            uint8Array.forEach(b => binary += String.fromCharCode(b));
            audio_base64 = btoa(binary);
        }

        try {
            const res = await fetch('/api/editar-pagina', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    instruccion_texto: instruccion,
                    audio_base64,
                    id_diseno_base: selectedDesignId,
                }),
            });

            if (res.status === 402) {
                setError('¡Créditos insuficientes! Habla con nosotros para recargar.');
                setEditando(false);
                return;
            }
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                setError(errData.error || 'Error al guardar los cambios.');
                setEditando(false);
                return;
            }

            const transcripcionHeader = res.headers.get('x-transcripcion-audio');
            if (transcripcionHeader) {
                setTranscripcion(atob(transcripcionHeader));
            }
            const creditosHeader = res.headers.get('x-creditos-restantes');
            if (creditosHeader && userData) {
                setUserData(prev => prev ? { ...prev, creditos_restantes: parseInt(creditosHeader, 10) } : null);
            }

            if (res.body) {
                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let htmlTemp = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    htmlTemp += decoder.decode(value, { stream: true });
                }

                // Actualizar el DOM SOLO al final para evitar congelar el navegador (re-renders masivos del iframe)
                const cleanHtml = htmlTemp.replace(/```html\n?/gi, '').replace(/```\n?/g, '');
                setUserData(prev => prev ? { ...prev, codigo_actual: cleanHtml } : null);

                setExito('¡Diseño actualizado! Los cambios ya están aplicados. 🎉');
                setInstruccion('');
                limpiarAudio();
            }
        } catch {
            setError('Error de conexión. Intenta de nuevo.');
        } finally {
            setEditando(false);
        }
    };

    const creditosBajos = (userData?.creditos_restantes ?? 0) <= 3;
    const sinCreditos = (userData?.creditos_restantes ?? 0) < CREDITOS_POR_EDICION;

    // ── UI: Pantalla de identificación por email ──
    if (!identificado) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col">
                <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Triangle className="text-white fill-white w-4 h-4" />
                        </div>
                        <span className="font-extrabold text-lg tracking-tight uppercase text-slate-300">
                            DIGI<span className="text-blue-400">TRIAL</span>
                        </span>
                    </Link>
                    <Link href="https://ia.digitrial.com.co" className="text-sm text-slate-400 hover:text-white transition-colors">
                        ← Generar nueva página
                    </Link>
                </nav>

                <main className="flex-1 flex items-center justify-center px-6">
                    <div className="max-w-md w-full text-center">
                        <div className="text-5xl mb-6">✏️</div>
                        <h1 className="text-3xl font-extrabold mb-3">Editor de tu Página Web</h1>
                        <p className="text-slate-400 mb-8">
                            Ingresa el correo con el que generaste tu diseño para acceder al editor con tus créditos gratuitos.
                        </p>

                        <form onSubmit={handleIdentificar} className="space-y-4">
                            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                                <Mail className="text-blue-400 w-5 h-5 flex-shrink-0" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="tu@correo.com"
                                    required
                                    className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none"
                                />
                            </div>
                            <button type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                                <Zap className="w-4 h-4" />
                                Acceder a mi editor
                            </button>
                        </form>
                        <p className="text-xs text-slate-600 mt-4">
                            ¿No tienes cuenta?{' '}
                            <Link href="https://ia.digitrial.com.co" className="text-blue-400 hover:text-blue-300 underline">
                                Genera tu página gratis aquí
                            </Link>
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    // ── UI: Cargando datos de Firebase ──
    if (cargando) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
                    <p className="text-slate-400">Cargando tu diseño...</p>
                </div>
            </div>
        );
    }

    // ── UI: Error de acceso ──
    if (error && !userData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-center px-6">
                <div className="max-w-md text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Cuenta no encontrada</h2>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <Link href="https://ia.digitrial.com.co"
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors inline-block">
                        Generar mi página gratis
                    </Link>
                </div>
            </div>
        );
    }

    // ── UI: Editor principal ──
    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">

            {/* ── Modal Instructivo de Bienvenida ── */}
            {showWelcomeModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/80 backdrop-blur-md">
                    <div className="bg-slate-800 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                        {/* Izquierda: Logo Area */}
                        <div className="bg-slate-900 md:w-2/5 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-700">
                            <h3 className="text-white font-bold mb-4 text-center">Logo de tu Marca</h3>
                            <div className="w-40 h-40 bg-white rounded-xl shadow-inner flex items-center justify-center mb-6 overflow-hidden relative">
                                {logoLoading ? (
                                    <div className="flex flex-col items-center text-slate-400">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
                                        <span className="text-xs text-center font-medium">Diseñando<br />vector...</span>
                                    </div>
                                ) : logoUrl ? (
                                    <img src={logoUrl} alt="Logo Generado" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <Triangle className="w-12 h-12 text-slate-200" />
                                )}
                            </div>

                            <a
                                href={logoUrl || '#'}
                                download={`Logo_${userData.nombre_negocio.replace(/\s+/g, '_')}.png`}
                                className={`w-full py-2.5 rounded-lg font-bold text-sm text-center transition-colors shadow-lg ${logoUrl ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed hidden'}`}
                            >
                                Descargar Logo HD
                            </a>
                        </div>

                        {/* Derecha: Instrucciones */}
                        <div className="p-8 md:w-3/5 flex flex-col justify-center">
                            <h2 className="text-2xl font-extrabold text-white mb-2">¡Tu maqueta está lista!</h2>
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                Hemos construido la estructura de tu página. Ahora es tu turno de darle el toque final.
                            </p>

                            <div className="space-y-4 mb-8">
                                <div className="flex gap-4 items-start bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                                    <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-white font-bold mt-0.5">1</div>
                                    <div>
                                        <h4 className="text-blue-100 font-bold text-sm mb-1">Textos (Edición Directa)</h4>
                                        <p className="text-slate-400 text-xs leading-relaxed">Haz clic directamente sobre cualquier título o párrafo en la página de la derecha para escribir tu propio texto con el teclado. ¡Se guarda solo!</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                                    <div className="bg-purple-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-white font-bold mt-0.5">2</div>
                                    <div>
                                        <h4 className="text-purple-100 font-bold text-sm mb-1">Imágenes y Diseño</h4>
                                        <p className="text-slate-400 text-xs leading-relaxed">Para cambiar fotografías, colores o agregar nuevas secciones, usa la caja de chat de Inteligencia Artificial.</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowWelcomeModal(false)}
                                className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors shadow-xl"
                            >
                                Entendido, ir al editor
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Triangle className="text-white fill-white w-3.5 h-3.5" />
                    </div>
                    <span className="font-extrabold text-base tracking-tight uppercase text-slate-300">
                        DIGI<span className="text-blue-400">TRIAL</span>
                    </span>
                </Link>

                {/* Créditos */}
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${creditosBajos
                    ? 'bg-red-500/20 border-red-500/40 text-red-300'
                    : 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                    }`}>
                    <Zap className="w-4 h-4" />
                    {userData?.creditos_restantes ?? 0} créditos
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>
                {/* ─── Panel izquierdo: Editor ─── */}
                <div className="w-full md:w-96 flex-shrink-0 flex flex-col border-r border-white/10 bg-slate-900 overflow-y-auto">
                    <div className="flex border-b border-white/10 sticky top-0 bg-slate-900 z-10">
                        <button
                            onClick={() => setActiveTab('editor')}
                            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'editor' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                            <Sparkles className="w-4 h-4" /> Editor
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'history' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                            <History className="w-4 h-4" /> ({userData?.historial_disenos?.length || 0}) Diseños
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === 'editor' ? (
                            <>
                                <h2 className="text-lg font-bold mb-1">
                                    Editando: <span className="text-blue-400">{userData?.nombre_negocio}</span>
                                </h2>
                                <p className="text-slate-500 text-xs mb-6">
                                    {userData?.nombre_contacto && `Hola, ${userData.nombre_contacto.split(' ')[0]} · `}
                                    Cada edición cuesta {CREDITOS_POR_EDICION} créditos
                                </p>

                                {creditosBajos && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-sm text-red-300">
                                        ⚠️ Te quedan <strong>{userData?.creditos_restantes ?? 0}</strong> créditos.{' '}
                                        <a href="https://wa.me/573123299053" target="_blank" className="underline text-red-200 hover:text-white">
                                            Contáctanos
                                        </a>{' '}para recargar.
                                    </div>
                                )}

                                {exito && (
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4 text-sm text-green-300 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 flex-shrink-0" />{exito}
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-sm text-red-300 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                                    </div>
                                )}

                                {transcripcion && (
                                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 mb-4 text-xs text-purple-300">
                                        🎤 Transcripción: <em>&quot;{transcripcion}&quot;</em>
                                    </div>
                                )}

                                <form onSubmit={handleEditar} className="space-y-4">
                                    {/* Instrucción de texto */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                                            ✍️ Instrucción en texto
                                        </label>
                                        <textarea
                                            value={instruccion}
                                            onChange={e => setInstruccion(e.target.value.slice(0, MAX_TEXTO_CHARS))}
                                            placeholder='Ej: "Cambia el fondo del hero a azul oscuro" o "Agrega una sección de precios"'
                                            rows={4}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-sm resize-none"
                                        />
                                        <p className="text-right text-xs text-slate-600 mt-1">{instruccion.length}/{MAX_TEXTO_CHARS}</p>
                                    </div>

                                    {/* Grabación de audio */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                                            🎤 Instrucción por audio (máx {MAX_AUDIO_SEGUNDOS}s)
                                        </label>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            {!audioBlob ? (
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        {grabando ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                                                                <span className="text-red-400 font-bold text-sm">
                                                                    Grabando... {segundosGrabacion}s / {MAX_AUDIO_SEGUNDOS}s
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <p className="text-slate-500 text-sm">Graba tu instrucción en voz</p>
                                                        )}
                                                        {grabando && (
                                                            <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden w-40">
                                                                <div
                                                                    className="h-full bg-red-500 rounded-full transition-all"
                                                                    style={{ width: `${(segundosGrabacion / MAX_AUDIO_SEGUNDOS) * 100}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button type="button"
                                                        onClick={grabando ? detenerGrabacion : iniciarGrabacion}
                                                        className={`p-3 rounded-full transition-colors ${grabando ? 'bg-red-500 hover:bg-red-400' : 'bg-blue-600 hover:bg-blue-500'}`}>
                                                        {grabando ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Audio listo ({segundosGrabacion}s)
                                                    </div>
                                                    <button type="button" onClick={limpiarAudio}
                                                        className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1">
                                                        <RefreshCw className="w-3 h-3" /> Regrabar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 mt-1">Si grabas audio, tiene prioridad sobre el texto.</p>
                                    </div>

                                    {/* Botón de envío */}
                                    <button type="submit"
                                        disabled={editando || sinCreditos || (!instruccion.trim() && !audioBlob)}
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg">
                                        {editando ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" />Aplicando cambios con IA...</>
                                        ) : sinCreditos ? (
                                            <><AlertCircle className="w-4 h-4" />Sin créditos disponibles</>
                                        ) : (
                                            <><Sparkles className="w-4 h-4" />Actualizar Diseño ({CREDITOS_POR_EDICION} créditos)<Send className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg mb-4 text-white">Tus últimos diseños</h3>
                                {(!userData?.historial_disenos || userData.historial_disenos.length === 0) ? (
                                    <div className="text-center p-6 bg-white/5 border border-white/10 rounded-xl">
                                        <Code className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                        <p className="text-slate-500 text-sm">Aún no hay diseños en el historial.</p>
                                        <p className="text-slate-600 text-xs mt-1">Has un cambio para guardar el actual.</p>
                                    </div>
                                ) : (
                                    userData.historial_disenos.map((diseno, index) => (
                                        <div
                                            key={diseno.id}
                                            onClick={() => {
                                                setSelectedDesignId(diseno.id);
                                                setUserData(prev => prev ? { ...prev, codigo_actual: diseno.codigo_actual } : null);
                                            }}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedDesignId === diseno.id || (!selectedDesignId && index === 0) ? 'bg-blue-600/20 border-blue-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">
                                                    {index === 0 ? 'Diseño más reciente' : `Versión anterior`}
                                                </span>
                                                <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded text-slate-400">
                                                    {new Date(diseno.fecha).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-300 line-clamp-3 italic">
                                                "{diseno.descripcion}"
                                            </p>
                                            {(selectedDesignId === diseno.id || (!selectedDesignId && index === 0)) && (
                                                <div className="mt-3 flex items-center gap-2 text-xs text-green-400 font-semibold bg-green-500/10 p-2 rounded-lg border border-green-500/20">
                                                    <Eye className="w-4 h-4" /> Diseñando esta versión
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-white/10">
                            <a href="https://wa.me/573123299053" target="_blank"
                                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                📱 Llevar a producción · Contactar
                            </a>
                        </div>
                    </div>
                </div>

                {/* ─── Panel derecho: Preview en tiempo real ─── */}
                <div className="flex-1 relative hidden md:block">
                    {editando && (
                        <div className="absolute inset-0 z-10 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-400 mx-auto mb-3" />
                                <p className="text-blue-300 font-medium">Gemini está aplicando tus cambios...</p>
                                <p className="text-slate-500 text-sm mt-1">Esto puede tomar hasta 30 segundos</p>
                            </div>
                        </div>
                    )}
                    {userData?.codigo_actual ? (
                        <iframe
                            srcDoc={injectEditorScript(userData.codigo_actual)}
                            className="w-full h-full border-none"
                            title="Vista previa en tiempo real"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-600">
                            <p>No hay diseño cargado aún.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Inyección del Script de Edición en el Iframe Web
function injectEditorScript(html: string): string {
    const scriptToInject = `
        <script>
            (function() {
                // Hacer todos los textos editables por defecto
                const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a');
                textElements.forEach(el => {
                    // Ignoramos elementos que sean puramente iconos
                    if(el.children.length === 0 || el.textContent.trim().length > 0) {
                        el.setAttribute('contenteditable', 'true');
                        el.style.outline = 'none';
                        el.style.transition = 'outline 0.2s, background-color 0.2s';
                        
                        el.addEventListener('focus', function() {
                            this.style.outline = '2px dashed rgba(59, 130, 246, 0.5)';
                            this.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                        });
                        
                        el.addEventListener('blur', function() {
                            this.style.outline = 'none';
                            this.style.backgroundColor = 'transparent';
                            
                            // Remover las selecciones y clases temporales de enfoque para limpiar el HTML
                            const clone = document.documentElement.cloneNode(true);
                            
                            // Limpiar atributos inyectados en el clon para guardar un DOM limpio
                            const clonedNodes = clone.querySelectorAll('[contenteditable="true"]');
                            clonedNodes.forEach(n => {
                                // Dejamos el contenteditable pero quitamos el CSS en-linea inyectado
                                n.style.outline = '';
                                n.style.backgroundColor = '';
                                if(n.getAttribute('style') === '') n.removeAttribute('style');
                            });
                            
                            // Enviar el HTML limpio de vuelta a Next.js
                            window.parent.postMessage({
                                type: 'SAVE_HTML',
                                html: '<!DOCTYPE html><html>' + clone.innerHTML + '</html>'
                            }, '*');
                        });
                    }
                });
            })();
        </script>
    `;

    // Lo insertamos justo antes de cerrar el body, o al final si no hay body
    if (html.includes('</body>')) {
        return html.replace('</body>', scriptToInject + '</body>');
    }
    return html + scriptToInject;
}

export default function EditorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
            </div>
        }>
            <EditorContent />
        </Suspense>
    );
}
