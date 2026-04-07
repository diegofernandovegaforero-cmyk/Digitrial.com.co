'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Triangle, ArrowRight, Sparkles, Loader2, Link2, ImagePlus, X, Type, Zap, Layout } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import PlanesDigitrial from '@/components/PlanesDigitrial';
import { optimizeHtmlImages } from '@/lib/storage-utils';

const emailToDocId = (email: string) => email.toLowerCase().trim().replace(/[.#$[\]]/g, '_');

type Step = 'form' | 'loading' | 'preview';

const LOADING_MESSAGES = [
    'Analizando tu descripción...',
    'Diseñando el Hero Section premium...',
    'Aplicando estilo visual y paleta de colores...',
    'Creando tarjetas de servicios con animaciones...',
    'Seleccionando imágenes estéticas de Pexels...',
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

            <AnimatePresence mode="wait">
                <motion.p 
                    key={percent >= 100 ? "delayed" : "normal"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-slate-600 text-xs mt-6 text-center max-w-sm px-4"
                >
                    {percent >= 100 
                        ? "Estamos finalizando los últimos detalles de tu diseño. El proceso de creación con IA puede tomar entre 1 y 2 minutos reales." 
                        : "Esto puede tomar entre 15 y 60 segundos"}
                </motion.p>
            </AnimatePresence>

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

    // Detect auth state to skip hero automatically if logged in
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthUser({ email: user.email, displayName: user.displayName });
                // Si el usuario ya está registrado, saltamos el hero y vamos al form
                setShowHero(false);
                setFormVisible(true);
            }
        });
        return unsub;
    }, []);

    // Hero CTA → go to /login
    const handleStartDesigning = () => {
        router.push('/login');
    };

    const [loadingMsg, setLoadingMsg] = useState(0);
    const [generatedHtml, setGeneratedHtml] = useState('');
    const [error, setError] = useState('');
    const [cookiesAccepted, setCookiesAccepted] = useState<boolean | null>(null);

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
        if (e.dataTransfer.files) {
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
            reader.onload = () => {
                const img = new globalThis.Image();
                img.src = reader.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/webp', 0.6));
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const MIN_CHARS_PRODUCTOS = 50;
    const MAX_CHARS_PRODUCTOS = 500;
    const [descripcion, setDescripcion] = useState('');
    const productosValido = (descripcion.length >= MIN_CHARS_PRODUCTOS && descripcion.length <= MAX_CHARS_PRODUCTOS);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('loading');
        setError('');
        let idx = 0;
        const interval = setInterval(() => { idx = (idx + 1) % LOADING_MESSAGES.length; setLoadingMsg(idx); }, 2200);
        try {
            if (!authUser || !authUser.email) {
                setError('Debes iniciar sesión para generar una página.');
                setStep('form');
                return;
            }
            const base64Images = await Promise.all(imagenesAdjuntas.map(img => getBase64(img.file)));

            const res = await fetch('/api/generar-pagina', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    descripcion,
                    imagenes_base64: base64Images,
                    email: authUser.email,
                    nombre_contacto: authUser.displayName || '',
                    rid: `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
                }),
            });

            clearInterval(interval);

            if (res.ok && res.body) {
                const contentType = res.headers.get('content-type') || '';

                if (contentType.includes('application/json')) {
                    const data = await res.json();
                    if (data.error) {
                        setError(data.error);
                        setStep('form');
                        return;
                    }
                    const html = data.html || '';
                    if (html && userEmail) {
                        try {
                            sessionStorage.setItem('digitrial_preview_html', html);
                            sessionStorage.setItem('digitrial_preview_email', userEmail);
                        } catch (e) {
                            console.warn('Error saving to sessionStorage:', e);
                        }
                    }
                    // Pequeño delay para dejar que Firebase guarde en segundo plano
                    setTimeout(() => {
                        router.push(`/editor?email=${encodeURIComponent(userEmail)}`);
                    }, 1500);
                } else {
                    const reader = res.body.getReader();
                    const decoder = new TextDecoder();
                    let htmlTemp = '';

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        htmlTemp += decoder.decode(value, { stream: true });
                        let cleanHtml = htmlTemp.replace(/```html/gi, '').replace(/```/g, '');
                        if (base64Images.length > 0) {
                            base64Images.forEach((b64, idx) => {
                                cleanHtml = cleanHtml.split(`UPLOADED_IMG_${idx + 1}`).join(b64);
                            });
                        }
                        setGeneratedHtml(cleanHtml);
                    }

                    let finalHtml = htmlTemp.replace(/```html/gi, '').replace(/```/g, '');
                    if (base64Images.length > 0) {
                        base64Images.forEach((b64, idx) => {
                            finalHtml = finalHtml.split(`UPLOADED_IMG_${idx + 1}`).join(b64);
                        });
                    }

                    if (finalHtml && userEmail) {
                        try {
                            sessionStorage.setItem('digitrial_preview_html', finalHtml);
                            sessionStorage.setItem('digitrial_preview_email', userEmail);
                        } catch (e) {
                            console.warn('Error saving to sessionStorage:', e);
                        }
                    }
                    // Pequeño delay para dejar que Firebase guarde en segundo plano
                    setTimeout(() => {
                        router.push(`/editor?email=${encodeURIComponent(userEmail)}`);
                    }, 2000);
                }
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
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [logoLoading, setLogoLoading] = useState(false);
    const [exitoGuardado, setExitoGuardado] = useState('');
    const hasParsedLogoRef = useRef(false);

    // ─── IMÁGENES ADJUNTAS AL EDITAR ───
    const [editImages, setEditImages] = useState<{ url: string; file: File }[]>([]);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
            const newImgs = files.map(f => ({ url: URL.createObjectURL(f), file: f }));
            setEditImages(prev => [...prev, ...newImgs].slice(0, 3));
        }
    };

    const removeEditImage = (idx: number) => {
        setEditImages(prev => {
            const next = [...prev];
            URL.revokeObjectURL(next[idx].url);
            next.splice(idx, 1);
            return next;
        });
    };

    // ─── LÓGICA DEL MODAL ONBOARDING Y EXTRACCIÓN DE LOGO ───
    useEffect(() => {
        if (step === 'preview' && generatedHtml && !hasParsedLogoRef.current) {
            hasParsedLogoRef.current = true;
            setShowWelcomeModal(true);
            setLogoLoading(true);

            setTimeout(() => {
                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(generatedHtml, 'text/html');
                    let finalSrc = null;

                    // 1. Prioridad 1: Buscar SVG vectorial en cabecera/brand
                    const svgLogo = doc.querySelector('header svg, nav svg, .logo svg, #logo svg, a.font-bold svg');
                    if (svgLogo) {
                        svgLogo.setAttribute('width', '100%');
                        svgLogo.setAttribute('height', '100%');
                        const s = new XMLSerializer().serializeToString(svgLogo);
                        finalSrc = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
                    }

                    // 2. Prioridad 2: Buscar imagenes que NO sean de Pexels/Mixkit (ej: placehold.co, ui-faces)
                    if (!finalSrc) {
                        const imgs = Array.from(doc.querySelectorAll('header img, nav img, .logo img, #logo img, img[alt*="logo" i]'));
                        const validImg = imgs.find(i => {
                            const src = i.getAttribute('src') || '';
                            return !src.includes('pexels.com') && !src.includes('mixkit.co');
                        });
                        if (validImg) finalSrc = validImg.getAttribute('src');
                    }

                    // 3. Fallback: Tipografía convertida a SVG Vectorial (Parte Superior Izquierda)
                    if (!finalSrc) {
                        // Evitar 'nav a' genéricos que capturan menús como "Quiénes Somos"
                        let txtElem = doc.querySelector('.logo, #logo, .brand, #brand, header h1, nav h1');

                        if (!txtElem) {
                            // Buscar el primer enlace del header que destaque (negrita o tamaño) o el primero en orden DOM
                            const headerLinks = Array.from(doc.querySelectorAll('header a, nav a'));
                            txtElem = headerLinks.find(a => {
                                const c = a.className || '';
                                return c.includes('font-bold') || c.includes('font-extrabold') || c.includes('text-xl') || c.includes('text-2xl');
                            }) || headerLinks[0];
                        }

                        if (txtElem && txtElem.textContent && txtElem.textContent.trim().length > 0) {
                            const t = txtElem.textContent.trim().substring(0, 15);
                            const dynamicSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="100%" height="100%"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="url(#g)" letter-spacing="-1">${t}</text></svg>`;
                            finalSrc = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(dynamicSvg);
                        }
                    }

                    if (finalSrc) setLogoUrl(finalSrc);
                } catch (err) {
                    console.error('Error extrayendo logo del DOM:', err);
                } finally {
                    setLogoLoading(false);
                }
            }, 1000); // Dar un segundo para que el HTML esté estable
        }
    }, [step, generatedHtml]);

    // Listener para recibir los cambios editados nativamente desde el Iframe
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.data?.type === 'SAVE_HTML' && event.data?.html && userEmail) {
                try {
                    const docId = emailToDocId(userEmail);
                    const docRef = doc(db, 'maquetasweb_usuarios', docId);
                    const optimizedHtml = await optimizeHtmlImages(event.data.html, userEmail);
                    await setDoc(docRef, { codigo_actual: optimizedHtml }, { merge: true });
                    setExitoGuardado('¡Texto modificado nativamente y guardado con éxito!');
                    setTimeout(() => setExitoGuardado(''), 4000);
                } catch (err) {
                    console.error('Error guardando HTML editado nativamente:', err);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [userEmail]);

    const handleEditRequest = async () => {
        if (!editInstruction.trim() || !userEmail) return;
        setIsEditing(true);
        // Guardar el HTML actual en sessionStorage para que el editor lo cargue directamente
        if (generatedHtml) {
            try {
                sessionStorage.setItem('digitrial_preview_html', generatedHtml);
                sessionStorage.setItem('digitrial_preview_email', userEmail);
            } catch (e) {
                console.warn('No se pudo guardar en sessionStorage:', e);
            }
        }

        // Codificar imágenes adjuntas en base64
        let base64Images: string[] = [];
        if (editImages.length > 0) {
            try {
                base64Images = await Promise.all(editImages.map(img => getBase64(img.file)));
            } catch (e) {
                console.warn('Error codificando imágenes:', e);
            }
        }

        // Guardar imágenes también en sessionStorage para que el editor las use
        if (base64Images.length > 0) {
            try {
                sessionStorage.setItem('digitrial_edit_images', JSON.stringify(base64Images));
            } catch (e) { /* ignore */ }
        } else {
            sessionStorage.removeItem('digitrial_edit_images');
        }

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
                        <Link href="https://digitrial.com.co" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
                                <Triangle className="text-white fill-white w-4 h-4" />
                            </div>
                            <span className="font-extrabold text-lg tracking-tight uppercase text-slate-300">
                                DIGI<span className="text-blue-400">TRIAL</span>
                            </span>
                        </Link>
                        <div className="flex items-center gap-6">
                            {authUser && (
                                <Link href="/proyectos" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                                    <Layout className="w-4 h-4" />
                                    Mis Proyectos
                                </Link>
                            )}
                            <Link href="https://digitrial.com.co" className="text-sm text-slate-400 hover:text-white transition-colors">← Volver al inicio</Link>
                        </div>
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
                    <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden text-blue-500/20">
                        {/* Animated Blobs */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                x: [0, 50, 0],
                                y: [0, -30, 0],
                                rotate: [0, 20, 0]
                            }}
                            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute w-[60vw] h-[60vw] bg-purple-600/20 rounded-full blur-[130px]"
                        />
                        <motion.div
                            animate={{
                                scale: [1.2, 1, 1.2],
                                x: [0, -60, 0],
                                y: [0, 40, 0],
                                rotate: [0, -15, 0]
                            }}
                            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute w-[45vw] h-[45vw] bg-blue-600/15 rounded-full blur-[100px] translate-y-24"
                        />

                        {/* Floating Particles */}
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    x: Math.random() * 100 - 50 + "%",
                                    y: Math.random() * 100 - 50 + "%",
                                    opacity: Math.random() * 0.3,
                                    scale: Math.random() * 0.5 + 0.5
                                }}
                                animate={{
                                    y: [0, -100, 0],
                                    x: [0, (Math.random() - 0.5) * 50, 0],
                                    opacity: [0.1, 0.4, 0.1]
                                }}
                                transition={{
                                    duration: 10 + Math.random() * 15,
                                    repeat: Infinity,
                                    ease: "linear",
                                    delay: Math.random() * 5
                                }}
                                className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
                            />
                        ))}
                    </div>

                    <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="flex flex-wrap items-center justify-center gap-2 mb-8 text-sm sm:text-base text-gray-300"
                        >
                            <span className="font-semibold text-white">Excelente</span>
                            <span className="text-green-400 text-xl tracking-widest leading-none">★★★★★</span>
                            <span className="opacity-70">La agencia digital preferida en Colombia</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight"
                        >
                            Diseña tu web{' '}
                            <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400">
                                hoy mismo
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                            className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed"
                        >
                            Nuestra IA en Digitrial lo crea al instante, sin programar, lista para más ventas. Inicia sesión de forma segura con Google o correo y empieza hoy.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.6, type: "spring", stiffness: 200 }}
                            className="flex flex-col items-center"
                        >
                            <motion.button
                                onClick={handleStartDesigning}
                                animate={{ scale: [1, 1.06, 1, 1.06, 1] }}
                                transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity, 
                                    repeatDelay: 1,
                                    ease: "easeInOut" 
                                }}
                                whileHover={{ scale: 1.08 }}
                                className="bg-white text-black font-bold text-lg px-10 py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-[0_0_50px_rgba(255,255,255,0.15)] flex items-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                Empezar a diseñar gratis
                            </motion.button>
                            <span className="text-sm text-gray-500 mt-4 font-medium tracking-wide">
                                No necesitas tarjeta de crédito · Obtienes 10 créditos de regalo
                            </span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            transition={{ duration: 1, delay: 1 }}
                            className="mt-16 flex flex-col items-center gap-2"
                        >
                            <span className="text-xs text-gray-500 uppercase tracking-widest">Generado con IA</span>
                            <div className="w-px h-8 bg-gradient-to-b from-gray-500 to-transparent" />
                        </motion.div>
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
                                        value={descripcion}
                                        onChange={e => setDescripcion(e.target.value.slice(0, MAX_CHARS_PRODUCTOS))}
                                        rows={8}
                                        maxLength={MAX_CHARS_PRODUCTOS}
                                        placeholder={`Cuéntanos tu idea, o arrastra imágenes aquí (ej: capturas de pantalla) para diseñar... (mín. ${MIN_CHARS_PRODUCTOS} caracteres)`}
                                        className={`w-full bg-white/10 border rounded-xl px-4 py-3 pb-16 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition resize-none text-sm border-white/20 focus:border-blue-500 focus:ring-blue-500/20 ${isDragging ? 'opacity-50' : ''}`}
                                    />

                                    {/* Preview Imágenes Adjuntas */}
                                    {/* Preview Imágenes Adjuntas */}
                                    {imagenesAdjuntas.length > 0 && (
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

                                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
                                        <span className={`text-xs pointer-events-none ${descripcion.length >= MIN_CHARS_PRODUCTOS ? 'text-green-400 font-semibold' : 'text-slate-600'}`}>
                                            {descripcion.length >= MIN_CHARS_PRODUCTOS ? '✅' : ''} {descripcion.length}/{MAX_CHARS_PRODUCTOS}
                                        </span>

                                        <div className="flex gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handleImageSelect}
                                                disabled={imagenesAdjuntas.length >= 3}
                                            />
                                            <button type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={imagenesAdjuntas.length >= 3}
                                                title="Adjuntar capturas de pantalla o referencias (Máx. 3)"
                                                className={`pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${imagenesAdjuntas.length >= 3
                                                    ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                                                    : 'bg-white/10 hover:bg-blue-600/60 text-slate-400 hover:text-white'
                                                    }`}>
                                                <ImagePlus className="w-3.5 h-3.5" /> Adjuntar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Barra de progreso de caracteres */}
                                <div className="mt-1.5 h-1 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-300 ${descripcion.length >= MIN_CHARS_PRODUCTOS ? 'bg-green-500' : 'bg-blue-500'}`}
                                        style={{ width: `${Math.min((descripcion.length / MAX_CHARS_PRODUCTOS) * 100, 100)}%` }}
                                    />
                                </div>

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
                            disabled={!productosValido || !authUser}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 text-lg">
                            <Sparkles className="w-5 h-5" />
                            {!authUser 
                                ? 'Inicia sesión para generar' 
                                : (productosValido ? 'Generar mi Página Web (5 créditos)' : `Faltan ${MIN_CHARS_PRODUCTOS - descripcion.length} caracteres...`)}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <p className="text-center text-xs text-slate-500">✅ Diseño inicial: 5 créditos · Edición o Guardado: 1 crédito · Límite máximo: 1 diseño por cuenta (10 créditos de regalo)</p>
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
                    {/* Alerta flotante de éxito al guardar texto nativo */}
                    <AnimatePresence>
                        {exitoGuardado && (
                            <motion.div
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-600/95 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(22,163,74,0.4)] border border-green-400/30 flex items-center gap-2 font-medium"
                            >
                                <Sparkles className="w-5 h-5 text-green-200" />
                                {exitoGuardado}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Iframe ocupando el 100% de la pantalla */}
                    <iframe
                        srcDoc={injectEditorScript(generatedHtml)}
                        className="w-full h-full border-none"
                        title="Tu página web generada"
                    />

                    {/* MODAL DE BIENVENIDA Y ONBOARDING */}
                    <AnimatePresence>
                        {showWelcomeModal && (
                            <motion.div
                                initial={{ opacity: 0, x: -50, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                                className="fixed bottom-6 left-6 z-[70] w-[340px] bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[-10px_10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                            >
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-white" />
                                        <h2 className="text-sm font-bold text-white">Tu Maqueta está Lista</h2>
                                    </div>
                                    <button onClick={() => setShowWelcomeModal(false)} className="text-white/80 hover:text-white bg-white/10 p-1.5 rounded-lg transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-4 overflow-y-auto max-h-[70vh]">


                                    {/* INSTRUCTIONS SECTION */}
                                    <h3 className="text-xs font-semibold text-slate-300 mb-2 block">
                                        Opciones de Edición
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex gap-2.5 bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                                            <Type className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-xs font-bold text-blue-100 mb-0.5">Editar Textos Nativos</h4>
                                                <p className="text-[10px] text-blue-200/70 leading-snug">
                                                    Haz doble clic en cualquier texto del lado derecho para escribir sobre él.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2.5 bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg">
                                            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-xs font-bold text-purple-100 mb-0.5">Renovar Imágenes/Diseño</h4>
                                                <p className="text-[10px] text-purple-200/70 leading-snug">
                                                    Si no te gusta el acomodo o fotos, usa el botón <b>&quot;✨ Editar Web&quot;</b>.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Botón Flotante para abrir panel lateral */}
                    {!editPanelOpen && (
                        <motion.button
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            onClick={() => setEditPanelOpen(true)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-600/90 hover:bg-blue-600 text-white p-3 md:p-4 rounded-l-2xl shadow-[-10px_0_30px_rgba(37,99,235,0.3)] backdrop-blur-md border border-r-0 border-white/20 transition-all z-40 group flex items-center gap-2"
                        >
                            <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                            <span className="font-bold text-sm tracking-wide mr-1 shadow-black drop-shadow-md">Editar Web</span>
                        </motion.button>
                    )}

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

                                                {/* Imágenes adjuntas */}
                                                {editImages.length > 0 && (
                                                    <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-white/10">
                                                        {editImages.map((img, idx) => (
                                                            <div key={idx} className="relative w-14 h-14 rounded-lg border border-white/20 overflow-hidden group">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img src={img.url} alt="" className="w-full h-full object-cover" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeEditImage(idx)}
                                                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <X className="w-4 h-4 text-white" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Botón adjuntar imágenes */}
                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                                                    <span className="text-[10px] text-slate-600">Máx. 3 imágenes de referencia</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        className="hidden"
                                                        ref={editFileInputRef}
                                                        onChange={handleEditImageSelect}
                                                        disabled={editImages.length >= 3}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => editFileInputRef.current?.click()}
                                                        disabled={editImages.length >= 3}
                                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${editImages.length >= 3
                                                            ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                                                            : 'bg-white/10 hover:bg-blue-600/60 text-slate-400 hover:text-white'}`}
                                                    >
                                                        <ImagePlus className="w-3.5 h-3.5" /> Adjuntar imágenes
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleEditRequest}
                                                disabled={!editInstruction.trim() || isEditing || !userEmail}
                                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                                            >
                                                {isEditing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                                {isEditing ? 'Procesando cambios...' : (!userEmail ? 'Inicia sesión para editar' : 'Aplicar Modificaciones')}
                                            </button>

                                            <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-3 flex flex-col items-center justify-center text-center mt-4">
                                                <div className="flex items-center gap-1.5 text-blue-300 font-bold text-sm mb-1">
                                                    <Zap className="w-4 h-4 text-blue-400" />
                                                    Créditos de Edición
                                                </div>
                                                <p className="text-xs text-blue-200/70 leading-relaxed">
                                                    Cuentas con <strong>15 créditos gratuitos</strong> iniciales. <br />
                                                    Cada modificación por IA consume <strong>3 créditos</strong>.<br />
                                                    Tienes hasta <strong>5 intentos de diseño</strong> sin costo.
                                                </p>
                                            </div>

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

                    {/* ── Módulo de Precios y Lanzamiento ── */}
                    <PlanesDigitrial />

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

// Inyección del Script de Edición en el Iframe Web
function injectEditorScript(html: string): string {
    const scriptToInject = `
        <script>
            (function() {
                // Hacer todos los textos editables por defecto
                const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a');
                textElements.forEach(el => {
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
                            
                            const clone = document.documentElement.cloneNode(true);
                            const clonedNodes = clone.querySelectorAll('[contenteditable="true"]');
                            clonedNodes.forEach(n => {
                                n.style.outline = '';
                                n.style.backgroundColor = '';
                                if(n.getAttribute('style') === '') n.removeAttribute('style');
                            });
                            
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

    if (html.includes('</body>')) {
        return html.replace('</body>', scriptToInject + '</body>');
    }
    return html + scriptToInject;
}
