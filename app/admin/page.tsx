'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Triangle, Download, Eye, Search, User, Mail, Calendar, FileCode, Loader2, LogOut, Copy, Check, X } from 'lucide-react';
import Link from 'next/link';

const ADMIN_EMAIL = 'diegofernandovegaforero@gmail.com';

interface Design {
    id: string;
    codigo_actual: string;
    descripcion: string;
    fecha: string;
    userName: string;
    userEmail: string;
}

export default function AdminPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [designs, setDesigns] = useState<Design[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [fetching, setFetching] = useState(false);
    const [previewDesign, setPreviewDesign] = useState<Design | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusMsg, setStatusMsg] = useState<string>('Iniciando...');

    useEffect(() => {
        console.log('ADMIN_AUTH: Initializing Auth Listener...');
        setStatusMsg('Verificando sesión...');
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) {
                console.log('ADMIN_AUTH: User detected:', u.email);
                if (u.email?.toLowerCase().trim() === ADMIN_EMAIL) {
                    console.log('ADMIN_AUTH: Access Granted');
                    setStatusMsg('Acceso concedido. Cargando datos...');
                    setUser(u);
                    fetchDesigns(u.email);
                } else {
                    console.warn('ADMIN_AUTH: Unauthorized Email:', u.email);
                    setStatusMsg('Acceso denegado: Email no autorizado.');
                    setUser(null);
                    setError(`Tu cuenta (${u.email}) no tiene permisos de administrador.`);
                    setLoading(false);
                }
            } else {
                console.log('ADMIN_AUTH: No user detected');
                setStatusMsg('No hay sesión activa.');
                setUser(null);
                setLoading(false);
            }
        });
        return unsubscribe;
    }, []);

    const fetchDesigns = async (email: string) => {
        console.log('ADMIN_FETCH: Starting fetch for', email);
        setFetching(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/designs?email=${encodeURIComponent(email)}`);
            console.log('ADMIN_FETCH: Response Status:', res.status);
            if (res.ok) {
                const data = await res.json();
                console.log(`ADMIN_FETCH: Fetched ${data.designs?.length} designs`);
                setDesigns(data.designs || []);
            } else {
                const errData = await res.json();
                console.error('ADMIN_FETCH: API Error:', errData);
                const detailStr = errData.details ? ` (${errData.details})` : '';
                setError((errData.error || 'Error al cargar los diseños') + detailStr);
                setStatusMsg('Error en la carga de datos.');
            }
        } catch (error: any) {
            console.error('ADMIN_FETCH: Catch block Error:', error);
            setError('Error de conexión: ' + (error.message || 'Error desconocido'));
            setStatusMsg('Error crítico de conexión.');
        } finally {
            setFetching(false);
            setLoading(false);
        }
    };

    const fetchFullCode = async (designId: string) => {
        if (!user) return null;
        try {
            const res = await fetch(`/api/admin/designs/code?email=${encodeURIComponent(user.email)}&id=${designId}`);
            if (res.ok) {
                const data = await res.json();
                return data.code;
            }
        } catch (e) {
            console.error('Error fetching full code:', e);
        }
        return null;
    };

    const handleDownload = async (design: Design) => {
        let code = design.codigo_actual;
        if (code === "[CODE_AVAILABLE]") {
            setStatusMsg('Descargando código completo...');
            code = await fetchFullCode(design.id);
            if (!code) {
                setError('No se pudo recuperar el código completo.');
                return;
            }
        }
        
        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `digitrial-${design.userName.replace(/\s+/g, '-').toLowerCase()}-${design.id}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatusMsg('Descarga completada.');
    };

    const handlePreview = async (design: Design) => {
        if (design.codigo_actual === "[CODE_AVAILABLE]") {
            setStatusMsg('Cargando previsualización...');
            const code = await fetchFullCode(design.id);
            if (code) {
                setPreviewDesign({ ...design, codigo_actual: code });
                setStatusMsg('Código cargado.');
            } else {
                setError('Error al cargar el código.');
            }
        } else {
            setPreviewDesign(design);
        }
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filteredDesigns = designs.filter(d => 
        d.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                    <User className="w-8 h-8 text-blue-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Panel de Administrador</h1>
                <p className="text-slate-400 max-w-sm mb-8">
                    {error ? error : 'Por favor, inicia sesión con la cuenta autorizada para gestionar los diseños.'}
                </p>
                <Link href="/login?redirect=/admin" className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition shadow-lg shadow-white/5">
                    Iniciar Sesión como Admin
                </Link>
                {error && (
                   <button onClick={() => auth.signOut()} className="mt-4 text-xs text-slate-500 underline">
                       Cerrar sesión actual
                   </button>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white font-sans">
            {/* Nav */}
            <nav className="border-b border-white/10 px-8 py-4 flex items-center justify-between bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Triangle className="text-white fill-white w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-lg tracking-tight uppercase">
                        Admin<span className="text-blue-400">Panel</span>
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-white">{user.displayName || 'Admin'}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                    <button onClick={() => auth.signOut()} className="p-2 hover:bg-white/5 rounded-lg transition text-slate-400">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            <main className="p-8 max-w-7xl mx-auto">
                <div className="mb-4 text-xs font-mono text-slate-500 bg-white/5 p-2 rounded">
                    Status: {statusMsg}
                </div>
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Diseños Generados</h1>
                        <p className="text-slate-400">Gestiona y descarga los códigos HTML creados por tus clientes.</p>
                        {error && <p className="text-red-400 text-sm mt-2 flex items-center gap-2">⚠️ {error}</p>}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Buscar por nombre, email o descripción..." 
                            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-slate-300 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold">Usuario</th>
                                    <th className="px-6 py-4 font-semibold">Fecha</th>
                                    <th className="px-6 py-4 font-semibold">Descripción</th>
                                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {fetching ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                                <span>Cargando diseños...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredDesigns.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                            No se encontraron diseños.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDesigns.map((design) => (
                                        <tr key={design.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">{design.userName}</p>
                                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                                            <Mail className="w-3 h-3" />
                                                            {design.userEmail}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs text-slate-300">
                                                    <Calendar className="w-3.5 h-3.5 opacity-50" />
                                                    {new Date(design.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-slate-400 max-w-xs truncate" title={design.descripcion}>
                                                    {design.descripcion}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handlePreview(design)}
                                                        className="p-2 bg-white/5 hover:bg-blue-600/20 text-blue-400 rounded-lg transition"
                                                        title="Ver Código"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDownload(design)}
                                                        className="p-2 bg-white/5 hover:bg-green-600/20 text-green-400 rounded-lg transition"
                                                        title="Descargar HTML"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Preview Modal */}
            {previewDesign && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#18181b] w-full max-w-5xl h-[80vh] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
                        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-3">
                                <FileCode className="w-5 h-5 text-blue-400" />
                                <div>
                                    <h3 className="text-sm font-bold">{previewDesign.userName}</h3>
                                    <p className="text-xs text-slate-500">{previewDesign.userEmail}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => handleCopy(previewDesign.codigo_actual)}
                                    className="px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition flex items-center gap-2"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copied ? 'Copiado' : 'Copiar Código'}
                                </button>
                                <button 
                                    onClick={() => handleDownload(previewDesign)}
                                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition flex items-center gap-2"
                                >
                                    <Download className="w-3.5 h-3.5" /> Descargar
                                </button>
                                <button 
                                    onClick={() => setPreviewDesign(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto bg-black/50 p-6 font-mono text-[11px] leading-relaxed scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            <pre className="text-slate-300 whitespace-pre-wrap selection:bg-blue-500/30">
                                {previewDesign.codigo_actual}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
