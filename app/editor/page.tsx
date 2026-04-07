'use client';
import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Triangle, Sparkles, Send, AlertCircle, CheckCircle, Loader2, RefreshCw, Zap, Mail, History, Eye, Code, Type, Download, X, ImagePlus, LogOut, Layout } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, getDoc, collection, setDoc, increment } from 'firebase/firestore';
import PlanesDigitrial from '@/components/PlanesDigitrial';
import RecargaCreditos from '@/components/RecargaCreditos';
import { optimizeHtmlImages } from '@/lib/storage-utils';

const CREDITOS_POR_EDICION = 1;
const COSTO_GUARDADO_MANUAL = 1;
const MAX_TEXTO_CHARS = 500;

// Sanitizar email para usarlo como Firestore doc ID (igual que en el backend)
const emailToDocId = (email: string) =>
    email.toLowerCase().trim().replace(/[.#$[\]]/g, '_');

// Inyección del Script de Edición en el Iframe Web
function injectEditorScript(html: string, sinCreditos: boolean = false): string {
    const scriptToInject = `
        <script>
            (function() {
                const isSinCreditos = ${sinCreditos};

                // BLOQUEO TOTAL DE NAVEGACIÓN: Atrapa todos los clics en fase de captura e impide cualquier redirección
                document.addEventListener('click', function(e) {
                    const target = e.target.closest('a') || e.target.closest('button');
                    if (target) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }, true);

                // Regla CSS de emergencia para ocultar cualquier rastro de la barra lateral
                const style = document.createElement('style');
                style.textContent = '.md\\\\:w-96, .w-96 { display: none !important; } .fixed.top-0.left-0.z-50 { display: none !important; }';
                document.head.appendChild(style);

                // FUNCIÓN DE LIMPIEZA REFORZADA: Elimina cualquier rastro de la interfaz del editor o navbars de la plataforma
                const cleanupUI = () => {
                    // Selectores comunes de la interfaz de Digitrial
                    const selectors = ['.md\\\\:w-96', '.w-96', 'nav', 'div', 'button', 'span', 'a'];
                    document.querySelectorAll(selectors.join(',')).forEach(el => {
                        const text = el.innerText || '';
                        const hasEditorText = text.includes('Editando:') || text.includes('Costo por edición') || text.includes('Actualizar Diseño') || text.includes('Guardar esta Maqueta') || text.includes('INICIAR SESIÓN') || (text.includes('DIGITRIAL') && el.tagName === 'NAV');
                        const isDigitrialHeader = el.tagName === 'NAV' && (text.includes('Inicio') && text.includes('IA') && text.includes('Contacto'));
                        
                        if (hasEditorText || isDigitrialHeader) {
                            el.remove();
                        }
                    });
                };

                // Ejecutar limpieza inicial y periódica
                cleanupUI();
                const cleanupInterval = setInterval(cleanupUI, 500);
                setTimeout(() => clearInterval(cleanupInterval), 5000);

                // Hacer los textos principales editables
                const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a');
                
                textElements.forEach(el => {
                    if(el.children.length === 0 || el.textContent.trim().length > 0) {
                        // TODO es editable ahora
                        el.setAttribute('contenteditable', 'true');
                        el.style.outline = 'none';
                        el.style.cursor = 'text';
                        
                        el.addEventListener('focus', function() {
                            this.style.outline = '2px dashed rgba(59, 130, 246, 0.5)';
                            this.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                            this._initialContent = this.innerText;
                        });
                        
                        el.addEventListener('blur', function() {
                            this.style.outline = 'none';
                            this.style.backgroundColor = 'transparent';
                            
                            cleanupUI();
                            
                            if (this.innerText === this._initialContent) return;

                            const clone = document.documentElement.cloneNode(true);
                            const clonedNodes = clone.querySelectorAll('[contenteditable="true"]');
                            clonedNodes.forEach(n => {
                                n.style.outline = '';
                                n.style.backgroundColor = '';
                                if(n.getAttribute('style') === '') n.removeAttribute('style');
                            });

                            clone.querySelectorAll('script').forEach(s => {
                                if (s.innerHTML.includes('isSinCreditos')) s.remove();
                            });
                            
                            window.parent.postMessage({
                                type: 'REQUEST_UPDATE_CONFIRM',
                                html: '<!DOCTYPE html><html>' + clone.innerHTML + '</html>'
                            }, '*');
                        });

                        el.addEventListener('keydown', function(e) {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                this.blur();
                            }
                        });

                        // Efecto visual al pasar el ratón
                        el.addEventListener('mouseover', function() {
                            if (document.activeElement !== this) {
                                this.style.outline = '1px dashed rgba(59, 130, 246, 0.3)';
                            }
                        });
                        
                        el.addEventListener('mouseout', function() {
                            if (document.activeElement !== this) {
                                this.style.outline = 'none';
                            }
                        });
                    }
                });

                // --- LÓGICA DE TOOLTIP PARA IMÁGENES ---
                const tooltipStyle = document.createElement('style');
                tooltipStyle.textContent = \`
                    .digitrial-img-tooltip {
                        position: fixed;
                        background: rgba(15, 23, 42, 0.98);
                        color: #e2e8f0;
                        padding: 12px 16px;
                        border-radius: 14px;
                        font-size: 13px;
                        line-height: 1.5;
                        max-width: 280px;
                        z-index: 99999;
                        pointer-events: none;
                        backdrop-filter: blur(12px);
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
                        font-family: system-ui, -apple-system, sans-serif;
                        transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                        opacity: 0;
                        transform: translateY(8px) scale(0.95);
                        text-align: center;
                    }
                    .digitrial-img-tooltip.visible {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    .digitrial-img-tooltip b {
                        color: #60a5fa;
                        display: block;
                        margin-bottom: 4px;
                    }
                \`;
                document.head.appendChild(tooltipStyle);

                const tooltip = document.createElement('div');
                tooltip.className = 'digitrial-img-tooltip';
                tooltip.innerHTML = "<b>¿Deseas cambiar esta imagen?</b> Solicita una nueva en la instrucción de texto (ej: 'Busca una de tecnología en Pexels') o adjunta el archivo que prefieras.";
                document.body.appendChild(tooltip);

                document.querySelectorAll('img').forEach(img => {
                    img.style.transition = 'filter 0.3s ease';
                    
                    img.addEventListener('mouseenter', (e) => {
                        img.style.filter = 'brightness(0.8) contrast(1.1)';
                        const rect = img.getBoundingClientRect();
                        
                        let left = rect.left + (rect.width / 2) - 140; 
                        let top = rect.top - 100;

                        if (left < 10) left = 10;
                        if (left + 280 > window.innerWidth - 10) left = window.innerWidth - 290;
                        if (top < 10) top = rect.bottom + 10;

                        tooltip.style.left = left + 'px';
                        tooltip.style.top = top + 'px';
                        tooltip.classList.add('visible');
                    });

                    img.addEventListener('mouseleave', () => {
                        img.style.filter = '';
                        tooltip.classList.remove('visible');
                    });
                });
            })();
        </script>
    `;

    if (html.includes('</body>')) {
        return html.replace('</body>', scriptToInject + '</body>');
    }
    return html + scriptToInject;
}

function EditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromUrl = searchParams.get('email') || '';
    const instruccionFromUrl = searchParams.get('instruccion') || '';

    // Check sessionStorage for HTML passed directly from the preview page
    const [sessionHtml] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        try {
            const stored = sessionStorage.getItem('digitrial_preview_html');
            const storedEmail = sessionStorage.getItem('digitrial_preview_email');
            // Only use if the email matches
            if (stored && storedEmail && storedEmail === emailFromUrl) {
                return stored;
            }
        } catch { /* ignore */ }
        return '';
    });

    const [email, setEmail] = useState(emailFromUrl);
    const [identificado, setIdentificado] = useState(!!emailFromUrl);
    const [userData, setUserData] = useState<{
        nombre_negocio: string;
        nombre_contacto: string;
        creditos_restantes: number;
        codigo_actual: string;
        historial_disenos?: { 
            id: string; 
            codigo_actual?: string; 
            descripcion: string; 
            fecha: string;
            has_separate_code?: boolean;
        }[];
    } | null>(sessionHtml ? {
        nombre_negocio: 'Tu negocio',
        nombre_contacto: '',
        creditos_restantes: 5,
        codigo_actual: sessionHtml,
        historial_disenos: [],
    } : null);
    const [cargando, setCargando] = useState(!sessionHtml && !!emailFromUrl);
    const [error, setError] = useState('');

    // Pestañas
    const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');
    const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);

    // Editor state
    const [instruccion, setInstruccion] = useState('');
    const [editando, setEditando] = useState(false);
    const [exito, setExito] = useState('');
    const [transcripcion, setTranscripcion] = useState('');
    const [showRecarga, setShowRecarga] = useState(false);
    const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
    const [pendingHtml, setPendingHtml] = useState('');

    // Audio recording — REMOVED
    // Logout logic
    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (err) {
            console.error("Error signing out:", err);
            setError('Error al cerrar sesión. Intenta de nuevo.');
        }
    };

    // Image attachments
    const [editImages, setEditImages] = useState<{ url: string; file: File }[]>([]);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
            setEditImages(prev => [...prev, ...files.map(f => ({ url: URL.createObjectURL(f), file: f }))].slice(0, 3));
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
    // Modal de Bienvenida e Instrucciones
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [logoLoading, setLogoLoading] = useState(false);
    const hasShownModalRef = useRef(false);
    const lastHistoryPushRef = useRef<number>(0);
    // Ref al iframe para controlar navegación
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Pre-fill instruction from URL param
    useEffect(() => {
        if (instruccionFromUrl) setInstruccion(instruccionFromUrl);
    }, [instruccionFromUrl]);


    // HANDLER DE MENSAJES: Recibe mensajes del iframe (guardar HTML, modales)
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (!event.data || typeof event.data !== 'object') return;
            const { type, html } = event.data;

            if (type === 'SAVE_HTML' && html && email) {
                // SOLO ACTUALIZACION LOCAL PARA VISTA PREVIA Y BOTÓN DE GUARDADO
                setUserData(prev => prev ? { ...prev, codigo_actual: html } : null);
            } else if (type === 'REQUEST_UPDATE_CONFIRM' && html && email) {
                setPendingHtml(html);
                setShowUpdateConfirm(true);
            } else if (type === 'SHOW_RECARGA_MODAL') {
                setShowRecarga(true);
            } else if (type === 'SHOW_AI_ALERT') {
                setExito('Usa el panel de Inteligencia Artificial para modificar este elemento.');
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [email]);

    // Auto-identify user if they are logged in via Firebase Auth
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user && user.email && !identificado) {
                setEmail(user.email);
                setIdentificado(true);
            }
        });
        return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Listener de Firestore en tiempo real (solo si no tenemos HTML de sessionStorage)
    useEffect(() => {
        if (!identificado || !email) return;
        // Si ya cargamos el HTML desde sessionStorage, no necesitamos Firebase
        if (sessionHtml) {
            setCargando(false);
            return;
        }

        let isSubscribed = true;
        const docId = emailToDocId(email);
        const docRef = doc(db, 'maquetasweb_usuarios', docId);

        // Limit the retry mechanism logic so it doesn't infinite loop with React state
        let currentRetries = 0;
        const maxFirebaseRetries = 5;
        let retryTimer: NodeJS.Timeout;

        const attemptLoad = () => {
            if (!isSubscribed) return;
            setCargando(true);

            const unsubscribeSnapshot = onSnapshot(docRef, async (snapshot) => {
                if (!isSubscribed) return;
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    const pastDesigns = data.historial_disenos || [];
                    let currentCode = data.codigo_actual || '';

                    if (!currentCode && pastDesigns.length > 0) {
                        // Si no hay código actual, lo intentamos sacar del primer elemento del historial
                        // (Compatible con formato viejo y nuevo)
                        currentCode = pastDesigns[0].codigo_actual || '';
                        setSelectedDesignId(pastDesigns[0].id);
                    }

                    setUserData({
                        nombre_negocio: data.nombre_negocio || data.nombre || 'Tu negocio',
                        nombre_contacto: data.nombre_contacto || '',
                        creditos_restantes: data.creditos_restantes ?? 6,
                        codigo_actual: currentCode,
                        historial_disenos: pastDesigns,
                    });
                    setError('');
                    setCargando(false);
                } else {
                    // Compatibilidad hacia atrás: buscar por campo 'email'
                    try {
                        const { collection, query, where, getDocs } = await import('firebase/firestore');
                        const q = query(collection(db, 'maquetasweb_usuarios'), where('email', '==', email.toLowerCase().trim()));
                        const querySnapshot = await getDocs(q);

                        if (!querySnapshot.empty) {
                            const data = querySnapshot.docs[0].data();
                            const pastDesigns = data.historial_disenos || [];
                            let currentCode = data.codigo_actual || '';

                            if (!currentCode && pastDesigns.length > 0) {
                                currentCode = pastDesigns[0].codigo_actual || '';
                                setSelectedDesignId(pastDesigns[0].id);
                            }

                            setUserData({
                                nombre_negocio: data.nombre_negocio || data.nombre || 'Tu negocio',
                                nombre_contacto: data.nombre_contacto || '',
                                creditos_restantes: data.creditos_restantes ?? 6,
                                codigo_actual: currentCode,
                                historial_disenos: pastDesigns,
                            });
                            setError('');
                            setCargando(false);
                            } else {
                                // If the document doesn't exist even after retries, it means it's a new user without generations.
                                if (currentRetries < maxFirebaseRetries) {
                                    currentRetries++;
                                    // Small delay before trying again (simulated by re-running attempt)
                                    retryTimer = setTimeout(() => {
                                        if (isSubscribed) {
                                            unsubscribeSnapshot(); // stop old listener before starting new logic
                                            attemptLoad();
                                        }
                                    }, 2000);
                                } else {
                                    // Successfully determine they are just empty
                                    setUserData({
                                        nombre_negocio: 'Tu negocio',
                                        nombre_contacto: '',
                                        creditos_restantes: 6,
                                        codigo_actual: '',
                                        historial_disenos: [],
                                    });
                                    setError('');
                                    setCargando(false);
                                }
                            }
                    } catch (err) {
                        console.error('Error buscando doc antiguo:', err);
                        setError('Error al cargar la cuenta.');
                        setCargando(false);
                    }
                }
            }, (err) => {
                console.error('Error de Firebase:', err);
                setError('Error conectando con los datos.');
                setCargando(false);
            });

            return unsubscribeSnapshot;
        };

        const finalUnsub = attemptLoad();

        return () => {
            isSubscribed = false;
            clearTimeout(retryTimer);
            if (finalUnsub && typeof finalUnsub === 'function') finalUnsub();
        };
    }, [identificado, email, sessionHtml]);

    // Mostrar modal la primera vez que carga un diseño - Desactivado por petición de usuario
    useEffect(() => {
        if (userData?.codigo_actual && !hasShownModalRef.current) {
            hasShownModalRef.current = true;
            setShowWelcomeModal(false); // Omitir modal a petición del usuario para ir directo al editor
            setLogoLoading(true);
            
            // Extraer logo nativo directamente del HTML generado
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(userData.codigo_actual, 'text/html');
                let finalSrc = null;

                // 1. Prioridad 1: Buscar SVG vectorial en cabecera/brand
                const svgLogo = doc.querySelector('header svg, nav svg, .logo svg, #logo svg, a.font-bold svg');
                if (svgLogo) {
                    svgLogo.setAttribute('width', '100%');
                    svgLogo.setAttribute('height', '100%');
                    const s = new XMLSerializer().serializeToString(svgLogo);
                    finalSrc = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
                }

                // 2. Prioridad 2: Buscar imagenes que NO sean de Pexels/Mixkit
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
                    // Buscamos clases típicas de logo, o el primer enlace del header
                    let txtElem = doc.querySelector('.logo, #logo, .brand, #brand, header h1, nav h1');

                    if (!txtElem) {
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
        }
    }, [userData?.codigo_actual]);

    // EFECTO DE GUARDADO INICIAL: Realiza una acción de guardados de seguridad gratuita al cargar por primera vez
    const hasAutoSavedRef = useRef(false);
    useEffect(() => {
        if (identificado && userData?.codigo_actual && !hasAutoSavedRef.current) {
            hasAutoSavedRef.current = true;
            // No consumimos créditos en el primer guardado de sesión
            console.log("[Editor] Realizando primer guardado automático gratuito...");
            handleManualSave(true);
        }
    }, [identificado, !!userData?.codigo_actual]);

    // EFECTO DE AUTOCARGA: Si el documento principal no tiene el código (por tamaño),
    // pero hay historial, cargamos el más reciente automáticamente.
    useEffect(() => {
        if (identificado && userData && !userData.codigo_actual && userData.historial_disenos && userData.historial_disenos.length > 0) {
            console.log("Autocargando diseño desde historial (código principal ausente)...");
            loadHistoricalDesign(userData.historial_disenos[0]);
        }
    }, [identificado, userData?.codigo_actual, userData?.historial_disenos]);

    // Listener para recibir alertas del Iframe (limpieza y control)
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'SHOW_RECARGA_MODAL') {
                setShowRecarga(true);
                return;
            }
            if (event.data?.type === 'SHOW_AI_ALERT') {
                setError('Para modificar este texto, o adjuntar fotos y diseño, por favor usa el panel de instrucciones de IA a tu izquierda.');
                setTimeout(() => setError(''), 5000);
                return;
            }
            if (event.data?.type === 'SAVE_HTML' && event.data?.html) {
                // Actualizar el código actual localmente tras cada edición directa (sin costo)
                setUserData(prev => prev ? { ...prev, codigo_actual: event.data.html } : null);
                return;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleManualSave = async (isFree = false) => {
        if (!email || !userData?.codigo_actual) {
            if (!isFree) setError('No hay diseño para guardar.');
            return;
        }

        // Si no es gratis, verificar créditos
        if (!isFree && (userData?.creditos_restantes ?? 0) < COSTO_GUARDADO_MANUAL) {
            setShowRecarga(true);
            return;
        }

        setEditando(true);
        setError('');
        setExito('');
        try {
            const docId = emailToDocId(email);
            const docRef = doc(db, 'maquetasweb_usuarios', docId);
            const historyId = Date.now().toString();
            
            // OPTIMIZACIÓN: Subir imágenes de Base64 a Storage para ahorrar espacio y mejorar capacidad
            if (!isFree) setExito('Optimizando imágenes y guardando...');
            const htmlOptimizado = await optimizeHtmlImages(userData.codigo_actual, email);
            if (!isFree) setExito('');

            // 1. Guardar a través de la API (Más seguro y maneja cobros)
            const res = await fetch('/api/maquetas/guardar-manual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    html: htmlOptimizado,
                    isFree,
                    descripcion: isFree ? "Inicio de sesión de edición" : (instruccion.trim() || "Guardado manual desde editor"),
                    rid: `save_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Error en el servidor al guardar.');
            }

            const creditosHeader = res.headers.get('x-creditos-restantes');
            const data = await res.json();
            const creditosRestantes = creditosHeader ? parseInt(creditosHeader, 10) : data.creditos_restantes;

            // 2. Actualizar estado local
            setUserData(prev => {
                if (!prev) return null;
                const newDesignMetadata = {
                    id: data.historyId,
                    descripcion: isFree ? "Inicio de sesión de edición" : (instruccion.trim() || "Guardado manual desde editor"),
                    fecha: new Date().toISOString(),
                    has_separate_code: true
                };
                const updatedHistory = [newDesignMetadata, ...(prev.historial_disenos || [])].slice(0, 10);
                
                return { 
                    ...prev, 
                    codigo_actual: htmlOptimizado,
                    historial_disenos: updatedHistory,
                    creditos_restantes: creditosRestantes
                };
            });
            
            if (!isFree) {
                setExito('¡Maqueta guardada con éxito!');
                setInstruccion('');
            }
        } catch (err: any) {
            console.error('Error in manual save:', err);
            if (!isFree) {
                let msg = 'Error al guardar la maqueta.';
                if (err.code === 'resource-exhausted' || err.message?.includes('too large')) {
                    msg += ' El archivo es muy grande para el límite de Firestore.';
                } else {
                    msg += ` Detalle: ${err.message || 'Error desconocido'}`;
                }
                setError(msg);
            }
        } finally {
            setEditando(false);
        }
    };

    const loadHistoricalDesign = async (diseno: any) => {
        if (selectedDesignId === diseno.id) return;
        
        setSelectedDesignId(diseno.id);
        setError('');
        setExito('');
        
        // Si el diseño ya tiene el código inyectado (historial viejo), lo usamos directamente
        if (diseno.codigo_actual) {
            setUserData(prev => prev ? { ...prev, codigo_actual: diseno.codigo_actual } : null);
            return;
        }

        // Si no tiene el código (historial nuevo con subcolección), lo descargamos del servidor
        setEditando(true);
        try {
            const res = await fetch(`/api/usuario/disenos/codigo?email=${encodeURIComponent(email)}&id=${diseno.id}`);
            if (res.ok) {
                const data = await res.json();
                setUserData(prev => prev ? { ...prev, codigo_actual: data.html } : null);
            } else {
                setError('No se pudo cargar el código de este diseño.');
            }
        } catch (err) {
            console.error('Error loading history design:', err);
            setError('Error de conexión al cargar diseño historial.');
        } finally {
            setEditando(false);
        }
    };

    const handleIdentificar = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setIdentificado(true);
    };

    // ── Enviar edición ──
    const handleEditar = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (sinCreditos) {
            setShowRecarga(true);
            return;
        }

        if (!instruccion.trim() && editImages.length === 0) {
            setError('Escribe una instrucción o adjunta al menos una imagen de referencia.');
            return;
        }
        if (editando) return;

        setEditando(true);
        setError('');
        setExito('');

        try {
            // Codificar imágenes adjuntas en base64
            let imagenes_base64: string[] = [];
            try {
                const storedImgs = sessionStorage.getItem('digitrial_edit_images');
                if (storedImgs) {
                    imagenes_base64 = JSON.parse(storedImgs);
                    sessionStorage.removeItem('digitrial_edit_images');
                }
            } catch { /* ignore */ }

            // Codificar imágenes adjuntas directamente en el editor
            if (editImages.length > 0) {
                const encoded = await Promise.all(editImages.map(img => new Promise<string>((res, rej) => {
                    const reader = new FileReader();
                    reader.onload = () => res(reader.result as string);
                    reader.onerror = rej;
                    reader.readAsDataURL(img.file);
                })));
                imagenes_base64 = [...imagenes_base64, ...encoded];
            }

            const res = await fetch('/api/editar-pagina', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    instruccion_texto: instruccion,
                    audio_base64: '',
                    id_diseno_base: selectedDesignId,
                    imagenes_base64,
                    rid: `edit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
                }),
            });

            if (res.status === 402) {
                setShowRecarga(true);
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
                let cleanHtml = htmlTemp.replace(/```html\n?/gi, '').replace(/```\n?/g, '');
                
                // 1. Restaurar imágenes que ya existían (preservadas por el backend como EXISTING_IMG_N)
                if (userData?.codigo_actual) {
                    const imagenesExistentes = Array.from(userData.codigo_actual.matchAll(/src="(data:image\/[^;]+;base64,[^"]+)"/gi)).map(m => m[1]);
                    imagenesExistentes.forEach((b64, idx) => {
                        cleanHtml = cleanHtml.split(`EXISTING_IMG_${idx + 1}`).join(b64);
                    });
                }

                // 2. Restaurar nuevas imágenes subidas en esta edición
                if (imagenes_base64.length > 0) {
                    imagenes_base64.forEach((b64, idx) => {
                        cleanHtml = cleanHtml.split(`UPLOADED_IMG_${idx + 1}`).join(b64);
                    });
                }
                setUserData(prev => prev ? { ...prev, codigo_actual: cleanHtml } : null);

                setExito('¡Diseño actualizado! Los cambios ya están aplicados. 🎉');
                setInstruccion('');
                setEditImages([]);
            }
        } catch {
            setError('Error de conexión. Intenta de nuevo.');
        } finally {
            setEditando(false);
        }
    };

    const creditosBajos = (userData?.creditos_restantes ?? 0) <= 2;
    const sinCreditos = (userData?.creditos_restantes ?? 0) < CREDITOS_POR_EDICION;

    // GUARDIAN DEL IFRAME: Si el iframe navega, lo reseteamos de vuelta al diseño correcto
    const handleIframeLoad = useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe || !userData?.codigo_actual) return;
        try {
            const loc = iframe.contentWindow?.location.href;
            if (loc && loc !== 'about:srcdoc' && loc !== 'about:blank') {
                console.warn('[Editor] Iframe navegó fuera del srcdoc:', loc, '→ Reseteando...');
                iframe.srcdoc = injectEditorScript(userData.codigo_actual, sinCreditos);
            }
        } catch {
            if (userData?.codigo_actual) {
                iframe.srcdoc = injectEditorScript(userData.codigo_actual, sinCreditos);
            }
        }
    }, [userData?.codigo_actual, sinCreditos]);

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
                    <Link href="/ia" className="text-sm text-slate-400 hover:text-white transition-colors">
                        ← Generar nueva página
                    </Link>
                    <Link href="/proyectos" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                        <Layout className="w-3 h-3" />
                         Mis Proyectos
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
                            <Link href="/ia" className="text-blue-400 hover:text-blue-300 underline">
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
                    <p className="text-slate-300 font-medium">Cargando tu cuenta y diseños...</p>
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
                    <p className="text-slate-400 mb-2">{error}</p>
                    <p className="text-slate-500 text-sm mb-6">
                        Si acabas de generar tu página, espera unos segundos y haz clic en Reintentar.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => { setError(''); setCargando(true); window.location.reload(); }}
                            className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 py-3 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" /> Reintentar
                        </button>
                        <Link href="/ia"
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors inline-block">
                            Generar mi página gratis
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ── UI: Editor principal ──
    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">

            {/* Modal Instructivo de Bienvenida (Flotante) */}
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
                                            Haz doble clic en cualquier texto de la vista previa para escribir sobre él.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2.5 bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg">
                                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold text-purple-100 mb-0.5">Renovar Imágenes/Diseño</h4>
                                        <p className="text-[10px] text-purple-200/70 leading-snug">
                                            Utiliza el chat de IA en la izquierda para cambiar el layout o las fotos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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

                <Link href="/proyectos" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <Layout className="w-3 h-3" />
                    Panel
                </Link>

                {/* Créditos y Logout */}
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border transition-all duration-500 ${creditosBajos
                        ? 'bg-red-500/30 border-red-500/50 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                        : 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                        }`}>
                        <Zap className="w-4 h-4" />
                        {userData?.creditos_restantes ?? 0} créditos
                        <button 
                            onClick={() => setShowRecarga(true)} 
                            className="ml-2 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter transition-all"
                        >
                            Recargar
                        </button>
                    </div>
                    
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Cerrar Sesión</span>
                    </button>
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
                                {(!userData?.codigo_actual) ? (
                                    <div className="flex flex-col items-center text-center p-6 bg-blue-900/10 border border-blue-500/20 rounded-xl mt-4">
                                        <Sparkles className="w-8 h-8 text-blue-400 mb-3" />
                                        <h3 className="text-white font-bold text-lg mb-2">Comienza tu primer diseño</h3>
                                        <p className="text-sm text-slate-400 mb-4 px-4">
                                            Aún no tienes ningún diseño para editar. Genera tu primera página web con inteligencia artificial y luego podrás personalizarla aquí.
                                        </p>
                                        <Link 
                                            href="/ia?form=true" 
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-blue-600/20 w-full"
                                        >
                                            Generar mi página web
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        {/* Estado y créditos */}
                                        <div className="flex items-center justify-between mb-4 mt-2">
                                            <div className="text-xs text-slate-400 font-medium tracking-wide">
                                                Costo por edición: <span className="text-slate-200">{CREDITOS_POR_EDICION} créditos</span>
                                            </div>
                                        </div>

                                        {creditosBajos && (
                                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-sm text-red-300">
                                                ⚠️ Te quedan <strong>{userData?.creditos_restantes ?? 0}</strong> créditos.{' '}
                                                <button onClick={() => setShowRecarga(true)} className="underline text-red-100 hover:text-white font-bold transition-all">
                                                    Recarga ahora
                                                </button>{' '}para seguir editando.
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

                                            {/* Imágenes de referencia */}
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                                                    🖼️ Imágenes de referencia
                                                </label>
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                    {/* Thumbnails */}
                                                    {editImages.length > 0 && (
                                                        <div className="flex gap-2 flex-wrap mb-3">
                                                            {editImages.map((img, idx) => (
                                                                <div key={idx} className="relative w-16 h-16 rounded-lg border border-white/20 overflow-hidden group">
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

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-slate-500">Máx. 3 imágenes</span>
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
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                                editImages.length >= 3
                                                                    ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                                                                    : 'bg-blue-600/30 hover:bg-blue-600/60 text-blue-300 hover:text-white border border-blue-500/30'
                                                            }`}
                                                        >
                                                            <ImagePlus className="w-3.5 h-3.5" /> Adjuntar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Botón de envío */}
                                            <div className="space-y-3">
                                                <button type="submit"
                                                    disabled={editando || sinCreditos || (!instruccion.trim() && editImages.length === 0)}
                                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg">
                                                    {editando ? (
                                                        <><Loader2 className="w-4 h-4 animate-spin" />Aplicando cambios...</>
                                                    ) : sinCreditos ? (
                                                        <><AlertCircle className="w-4 h-4" />Sin créditos disponibles</>
                                                    ) : (
                                                        <><Sparkles className="w-4 h-4" />Actualizar Diseño ({CREDITOS_POR_EDICION} créditos)<Send className="w-4 h-4" /></>
                                                    )}
                                                </button>

                                                <button type="button"
                                                    onClick={() => handleManualSave(false)}
                                                    disabled={editando || !userData?.codigo_actual || sinCreditos}
                                                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                                                    <History className="w-4 h-4 text-blue-400" />
                                                    Guardar esta Maqueta ({COSTO_GUARDADO_MANUAL} crédito)
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                )}
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
                                            onClick={() => loadHistoricalDesign(diseno)}
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
                            <Link href="/proyectos"
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                                <Layout className="w-4 h-4" />
                                Ir a Proyectos
                            </Link>
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
                            ref={iframeRef}
                            srcDoc={injectEditorScript(userData.codigo_actual, sinCreditos)}
                            className={`w-full h-full border-none transition-opacity ${editando ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}
                            title="Vista previa en tiempo real"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                            onLoad={handleIframeLoad}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-600">
                            <p>No hay diseño cargado aún.</p>
                        </div>
                    )}
                </div>
            </div>

                {/* Modal de Confirmación de Actualización */}
                <AnimatePresence>
                    {showUpdateConfirm && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowUpdateConfirm(false)}
                                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            />
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
                            >
                                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Sparkles className="w-8 h-8 text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Actualizar Diseño</h2>
                                <p className="text-slate-400 mb-8">
                                    ¿Deseas aplicar estos cambios a tu maqueta? Esta acción consumirá <span className="text-blue-400 font-bold">1 crédito</span>.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={async () => {
                                            if (pendingHtml) {
                                                setUserData(prev => prev ? { ...prev, codigo_actual: pendingHtml } : null);
                                                setTimeout(() => handleManualSave(false), 100);
                                            }
                                            setShowUpdateConfirm(false);
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Actualizar (1 Crédito)
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowUpdateConfirm(false);
                                            if (iframeRef.current && userData?.codigo_actual) {
                                                iframeRef.current.srcdoc = injectEditorScript(userData.codigo_actual, sinCreditos);
                                            }
                                        }}
                                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* ── Módulo de Precios y Lanzamiento ── */}
                <PlanesDigitrial />
                <RecargaCreditos isOpen={showRecarga} onClose={() => setShowRecarga(false)} />
        </div>
    );
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
