'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Triangle, Send, X, User, Bot, Sparkles, Loader2 } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export default function DigitChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: '¡Hola! Soy DIGIT, tu asistente de diseño web. ¿En qué puedo ayudarte hoy?',
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!message.trim() || isLoading) return;

        const userText = message.trim();
        const newUserMessage: Message = {
            id: Date.now().toString(),
            text: userText,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userText,
                }),
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            const data = await response.json();
            
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: data.text || 'Lamento no haber podido procesar tu respuesta en este momento.',
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botResponse]);
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: '¡Vaya! Parece que tengo un pequeño problema de conexión técnica. Por favor, intenta de nuevo en unos minutos.',
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white z-[60] border border-white/20 group"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X className="w-8 h-8" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="digit"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            className="flex flex-col items-center"
                        >
                            <Triangle className="w-7 h-7 fill-white" />
                            <span className="text-[8px] font-black mt-0.5 tracking-tighter">DIGIT</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Notification pulse if not open */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border border-white"></span>
                    </span>
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        className="fixed bottom-24 right-6 w-[90vw] sm:w-[400px] max-h-[600px] h-[70vh] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl z-[60] flex flex-col overflow-hidden border border-gray-100 dark:border-slate-800"
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                    <Triangle className="w-6 h-6 fill-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight uppercase tracking-widest flex items-center gap-2">
                                        DIGIT <Sparkles className="w-3 h-3 text-blue-200" />
                                    </h3>
                                    <p className="text-blue-100 text-xs font-medium">Arquitectura Digital IA</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
                        >
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                            {msg.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-sm ${msg.sender === 'user'
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            
                            {/* Thinking state */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="flex gap-3 max-w-[85%]">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center animate-pulse">
                                            <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-sm rounded-tl-none border border-slate-100 dark:border-slate-700 flex items-center gap-2 italic">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Digit está pensando...
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Escribe tu pregunta sobre diseño..."
                                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white pl-6 pr-14 py-4 rounded-2xl shadow-inner border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 disabled:opacity-50"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSend}
                                    className="absolute right-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                    disabled={isLoading || !message.trim()}
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-[0.2em] font-bold opacity-50">
                                Powered by Digitrial IA
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
