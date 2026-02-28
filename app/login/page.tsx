'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { Triangle, Eye, EyeOff, Loader2 } from 'lucide-react';

const TESTIMONIALS = [
    {
        text: '"Tenía mi negocio en Instagram y quería un sitio web profesional. En menos de 2 minutos la IA de Digitrial lo generó mejor de lo que esperaba."',
        name: 'Carolina Mejía',
        role: 'Emprendedora · Medellín',
    },
    {
        text: '"No soy técnico para nada. Describí mi restaurante y la página quedó lista con fotos, menú y botón de WhatsApp. Increíble."',
        name: 'Javier Ramírez',
        role: 'Propietario · Bogotá',
    },
    {
        text: '"Lo que más me gustó es que puedo editarla con voz. Es como tener un diseñador web disponible 24/7."',
        name: 'Sofía Torres',
        role: 'Consultora de Imagen · Cali',
    },
];

const emailToDocId = (email: string) =>
    email.toLowerCase().trim().replace(/[.#$[\]]/g, '_');

async function saveUserToFirestore(user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }) {
    if (!user.email) return;
    const docId = emailToDocId(user.email);
    const ref = doc(db, 'usuarios_leads', docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        await setDoc(ref, {
            uid: user.uid,
            email: user.email,
            nombre_contacto: user.displayName || '',
            photo_url: user.photoURL || '',
            creditos_restantes: 15,
            fecha_creacion: serverTimestamp(),
        });
    }
}

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/disena-tu-pagina?form=true';

    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [testimonialIdx, setTestimonialIdx] = useState(0);

    // Rotate testimonials
    useEffect(() => {
        const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
        return () => clearInterval(t);
    }, []);

    // Redirect if already logged in
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) router.replace(redirectTo);
        });
        return unsub;
    }, [redirectTo, router]);

    const handleGoogle = async () => {
        setGoogleLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await saveUserToFirestore(result.user);
            router.replace(redirectTo);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Error con Google. Intenta de nuevo.');
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isRegister) {
                const result = await createUserWithEmailAndPassword(auth, email, password);
                await saveUserToFirestore(result.user);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            router.replace(redirectTo);
        } catch (e: unknown) {
            const code = (e as { code?: string }).code;
            if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
                setError('Correo o contraseña incorrectos.');
            } else if (code === 'auth/email-already-in-use') {
                setError('Este correo ya está registrado. Inicia sesión.');
                setIsRegister(false);
            } else if (code === 'auth/weak-password') {
                setError('La contraseña debe tener al menos 6 caracteres.');
            } else {
                setError(e instanceof Error ? e.message : 'Error inesperado.');
            }
        } finally {
            setLoading(false);
        }
    };

    const t = TESTIMONIALS[testimonialIdx];

    return (
        <div className="min-h-screen flex">
            {/* ── LEFT PANEL ── */}
            <div className="flex-1 bg-white flex flex-col justify-center items-center px-8 py-12 lg:max-w-[480px]">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 mb-10 self-start">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow shadow-blue-600/30">
                        <Triangle className="text-white fill-white w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-lg tracking-tight uppercase text-slate-700">
                        DIGI<span className="text-blue-600">TRIAL</span>
                    </span>
                </Link>

                <div className="w-full max-w-sm">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
                        {isRegister ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}
                    </h1>
                    <p className="text-slate-500 text-sm mb-8">
                        {isRegister
                            ? 'Regístrate gratis y obtén 15 créditos para diseñar tu web.'
                            : 'Inicia sesión para continuar diseñando tu página web.'}
                    </p>

                    {/* Google Button */}
                    <button
                        onClick={handleGoogle}
                        disabled={googleLoading}
                        className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-lg py-3 px-4 text-slate-700 font-medium hover:bg-slate-50 transition-colors mb-5 disabled:opacity-60"
                    >
                        {googleLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        ) : (
                            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        Continuar con Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-400 uppercase tracking-widest">o</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="tu@correo.com"
                                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full border border-slate-200 rounded-lg px-4 py-3 pr-10 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-sm"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isRegister ? 'Crear cuenta gratis' : 'Iniciar sesión'}
                        </button>
                    </form>

                    {/* Toggle register / login */}
                    <p className="text-center text-sm text-slate-500 mt-6">
                        {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
                        <button
                            onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            {isRegister ? 'Iniciar sesión' : 'Regístrate gratis'}
                        </button>
                    </p>

                    <p className="text-center text-xs text-slate-400 mt-4">
                        Al continuar, aceptas nuestros{' '}
                        <Link href="/" className="underline hover:text-slate-600">Términos de servicio</Link>
                        {' '}y{' '}
                        <Link href="/" className="underline hover:text-slate-600">Política de privacidad</Link>.
                    </p>
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="hidden lg:flex flex-1 relative bg-[#09090b] items-center justify-center overflow-hidden">
                {/* Glow */}
                <div className="absolute inset-0 flex justify-center items-end pointer-events-none pb-0">
                    <div className="w-[60vw] h-[40vh] bg-purple-700/25 rounded-full blur-[120px] translate-y-20" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 max-w-lg px-12 text-center flex flex-col items-center">
                    {/* Dots indicator */}
                    <div className="flex gap-2 mb-10">
                        {TESTIMONIALS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setTestimonialIdx(i)}
                                className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? 'bg-white w-6' : 'bg-white/30'}`}
                            />
                        ))}
                    </div>

                    {/* Testimonial card */}
                    <div
                        key={testimonialIdx}
                        className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm text-left"
                        style={{ animation: 'fadeIn 0.5s ease' }}
                    >
                        <p className="text-white text-lg font-semibold leading-relaxed mb-6">
                            {t.text}
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {t.name.charAt(0)}
                            </div>
                            <div>
                                <div className="text-white font-semibold text-sm">{t.name}</div>
                                <div className="text-purple-400 text-xs">{t.role}</div>
                            </div>
                        </div>
                    </div>

                    {/* Brand tagline */}
                    <div className="mt-10">
                        <span className="text-white/30 text-sm uppercase tracking-widest">Digitrial · IA para tu negocio</span>
                    </div>
                </div>

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
