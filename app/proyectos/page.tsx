'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Triangle, 
    Plus, 
    Settings, 
    ExternalLink, 
    Trash2, 
    Zap, 
    Layout, 
    Calendar,
    ArrowRight,
    Loader2,
    Sparkles,
    LogOut,
    History,
    Pencil,
    Check,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import DigitrialLoader from '@/components/DigitrialLoader';

// Helper para ID de Firestore
const emailToDocId = (email: string) =>
    email.toLowerCase().trim().replace(/[.#$[\]]/g, '_');

export default function ProyectosPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // 1. Manejo de Autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                router.push('/login?redirect=/proyectos');
            }
        });
        return () => unsubscribe();
    }, [router]);

    // 2. Carga de Datos en Tiempo Real
    useEffect(() => {
        if (!user?.email) return;

        const docId = emailToDocId(user.email);
        const docRef = doc(db, 'maquetasweb_usuarios', docId);

        const unsub = onSnapshot(docRef, (snapshot) => {
            if (snapshot.exists()) {
                setUserData(snapshot.data());
            } else {
                setUserData({
                    historial_disenos: [],
                    creditos_restantes: 6,
                    limite_proyectos: 1
                });
            }
            setLoading(false);
        }, (error) => {
            console.error("Error loading projects:", error);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#0B1221] text-white selection:bg-blue-500/30">
            <Navbar />
            
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <main className="container mx-auto px-6 pt-32 pb-20 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-blue-400 font-bold tracking-widest uppercase text-xs mb-3"
                        >
                            <Layout className="w-4 h-4" />
                            Panel de Control
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black italic tracking-tight"
                        >
                            Mis Proyectos <span className="text-blue-500">Digitales</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-400 mt-3 max-w-lg"
                        >
                            Gestiona tus landing pages, edita el contenido con IA y visualiza tus créditos disponibles.
                        </motion.p>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-4"
                    >
                        <Link 
                            href="/ia"
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Plus className="w-5 h-5" />
                            Nuevo Proyecto
                        </Link>
                    </motion.div>
                </div>

                {/* Account Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    <StatCard 
                        icon={<Zap className="w-5 h-5 text-yellow-400" />}
                        label="Créditos Disponibles"
                        value={userData?.creditos_restantes ?? "-"}
                        subtext="Válido por 30 días"
                    />
                    <StatCard 
                        icon={<Layout className="w-5 h-5 text-blue-400" />}
                        label="Proyectos Activos"
                        value={userData?.historial_disenos?.length ?? 0}
                        subtext={`Límite: ${userData?.limite_proyectos ?? 1}`}
                    />
                    <StatCard 
                        icon={<History className="w-5 h-5 text-purple-400" />}
                        label="Última Edición"
                        value={userData?.ultima_edicion ? new Date(userData.ultima_edicion).toLocaleDateString() : "Hoy"}
                        subtext="Historial guardado"
                    />
                    <StatCard 
                        icon={<Sparkles className="w-5 h-5 text-emerald-400" />}
                        label="Tipo de Plan"
                        value={userData?.limite_proyectos > 1 ? (userData.limite_proyectos > 5 ? 'PRO' : 'RÁPIDO') : 'GRATIS'}
                        subtext="Explora más opciones"
                    />
                </div>

                {/* Projects Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <DigitrialLoader 
                            message="Cargando Proyectos" 
                            subtext="Preparando tu panel de control" 
                        />
                    </div>
                ) : userData?.historial_disenos?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userData.historial_disenos.map((proyecto: any, idx: number) => (
                            <ProyectoCard 
                                key={proyecto.id} 
                                proyecto={proyecto} 
                                email={user?.email}
                                index={idx}
                            />
                        ))}
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center"
                    >
                        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Layout className="w-10 h-10 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">No tienes proyectos aún</h2>
                        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                            Comienza hoy mismo a crear tu presencia digital con el poder de nuestra Inteligencia Artificial.
                        </p>
                        <Link 
                            href="/ia"
                            className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-colors"
                        >
                            Empezar mi primera web
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                )}
            </main>

            {/* Footer / Logout */}
            <div className="container mx-auto px-6 py-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <Triangle className="w-3 h-3 fill-slate-500" />
                    © 2026 DIGITRIAL. TODOS LOS DERECHOS RESERVADOS.
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión ({user?.email})
                </button>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, subtext }: any) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all group">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-3xl font-black italic mb-1">{value}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">{subtext}</div>
        </div>
    );
}

function ProyectoCard({ proyecto, email, index }: any) {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(proyecto.nombre_negocio || proyecto.descripcion?.split(' ').slice(0, 3).join(' ') || 'Mi Proyecto');
    const [loading, setLoading] = useState(false);

    const handleRename = async () => {
        if (!newName.trim() || newName === (proyecto.nombre_negocio || proyecto.descripcion?.split(' ').slice(0, 3).join(' '))) {
            setIsEditing(false);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/proyectos/renombrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    proyectoId: proyecto.id,
                    nuevoNombre: newName.trim()
                }),
            });
            if (!res.ok) throw new Error('Error al renombrar');
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert('No se pudo renombrar el proyecto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="group bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all"
        >
            {/* Project Preview Placeholder */}
            <div className="aspect-video bg-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                    <Layout className="w-12 h-12 text-blue-400/50" />
                </div>
                <div className="absolute top-4 left-4">
                    <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Publicado</span>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                        {isEditing ? (
                            <div className="flex items-center gap-2 bg-slate-900 border border-blue-500/50 rounded-lg p-1">
                                <input 
                                    autoFocus
                                    className="bg-transparent border-none text-white text-sm font-bold w-full focus:ring-0 p-1"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleRename();
                                        if (e.key === 'Escape') setIsEditing(false);
                                    }}
                                />
                                <button 
                                    onClick={handleRename}
                                    disabled={loading}
                                    className="p-1 text-green-400 hover:bg-white/5 rounded"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                </button>
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="p-1 text-red-400 hover:bg-white/5 rounded"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group/title">
                                <h3 className="text-xl font-bold truncate max-w-[180px]">
                                    {proyecto.nombre_negocio || proyecto.descripcion?.split(' ').slice(0, 3).join(' ') || 'Mi Proyecto'}
                                </h3>
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="opacity-0 group-hover:opacity-100 group-hover/title:opacity-100 p-1 text-slate-500 hover:text-white transition-all"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase mt-1">
                            <Calendar className="w-3 h-3" />
                            {proyecto.fecha ? new Date(proyecto.fecha).toLocaleDateString() : 'Fecha desconocida'}
                        </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex gap-2">
                    <Link 
                        href={`/editor?email=${encodeURIComponent(email)}&id=${proyecto.id}`}
                        className="flex-1 bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 rounded-xl py-3 text-center text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                        <Settings className="w-4 h-4" />
                        Editar
                    </Link>
                    <button 
                        onClick={() => {
                             window.open(`/editor?email=${encodeURIComponent(email)}&id=${proyecto.id}`, '_blank');
                        }}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
