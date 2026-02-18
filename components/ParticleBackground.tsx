'use client';
import { useEffect, useRef } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;       // radio del aro
    lineWidth: number;    // grosor del borde del aro
    opacity: number;
    glowColor: string;
}

interface BinaryLabel {
    x: number;
    y: number;
    text: string;
    alpha: number;
    life: number;         // frames restantes
    maxLife: number;
}

// ─── Configuración ────────────────────────────────────────────────────────────
const CONFIG = {
    particleCount: 65,          // número de aros
    maxSpeed: 0.35,             // velocidad máxima (lento = marca de agua)
    connectionDistance: 170,    // distancia máxima para dibujar línea
    lineOpacity: 0.28,          // opacidad de las líneas de conexión
    ringOpacity: 0.45,          // opacidad base de los aros
    mouseAttractionRadius: 180, // radio de atracción del mouse
    mouseAttractionForce: 0.012,// fuerza de atracción
    binarySpawnRate: 0.006,     // probabilidad por frame de generar texto binario
    binaryLifeFrames: 90,       // duración del texto binario en frames
    glowColors: [
        '#00d4ff', // cian
        '#7b61ff', // violeta
        '#00ffcc', // verde neón
        '#4488ff', // azul
    ],
};

// ─── Utilidades ───────────────────────────────────────────────────────────────
function randomBetween(a: number, b: number) {
    return a + Math.random() * (b - a);
}

function randomBinaryString(length: number) {
    const chars = '01 01 10 ◈ ◉ ⬡ 01';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const animFrameRef = useRef<number>(0);

    // Observar la clase page-dark en el body para mostrar/ocultar el canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        function syncVisibility() {
            if (!canvas) return;
            canvas.style.opacity = document.body.classList.contains('page-dark') ? '1' : '0';
        }

        syncVisibility(); // estado inicial

        const observer = new MutationObserver(syncVisibility);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    // ── Loop de animación principal ────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // ── Responsividad ──────────────────────────────────────────────────
        function resize() {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // ── Seguimiento del mouse ──────────────────────────────────────────
        function onMouseMove(e: MouseEvent) {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        }
        window.addEventListener('mousemove', onMouseMove);

        // ── Crear partículas ───────────────────────────────────────────────
        const particles: Particle[] = [];
        for (let i = 0; i < CONFIG.particleCount; i++) {
            particles.push({
                x: randomBetween(0, canvas.width),
                y: randomBetween(0, canvas.height),
                vx: randomBetween(-CONFIG.maxSpeed, CONFIG.maxSpeed),
                vy: randomBetween(-CONFIG.maxSpeed, CONFIG.maxSpeed),
                radius: randomBetween(4, 14),
                lineWidth: randomBetween(0.8, 2),
                opacity: randomBetween(0.08, CONFIG.ringOpacity),
                glowColor: CONFIG.glowColors[Math.floor(Math.random() * CONFIG.glowColors.length)],
            });
        }

        // ── Etiquetas binarias ─────────────────────────────────────────────
        const binaryLabels: BinaryLabel[] = [];

        // ── Loop de animación ──────────────────────────────────────────────
        function animate() {
            if (!canvas || !ctx) return;

            // Limpiar con fondo semi-transparente para efecto de estela
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const mouse = mouseRef.current;

            // ── Actualizar y dibujar partículas ────────────────────────────
            for (const p of particles) {
                // Atracción suave hacia el mouse
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONFIG.mouseAttractionRadius && dist > 0) {
                    const force = CONFIG.mouseAttractionForce * (1 - dist / CONFIG.mouseAttractionRadius);
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                }

                // Limitar velocidad máxima
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed > CONFIG.maxSpeed * 2) {
                    p.vx = (p.vx / speed) * CONFIG.maxSpeed * 2;
                    p.vy = (p.vy / speed) * CONFIG.maxSpeed * 2;
                }

                // Mover partícula
                p.x += p.vx;
                p.y += p.vy;

                // Rebotar en los bordes
                if (p.x < -p.radius) p.x = canvas.width + p.radius;
                if (p.x > canvas.width + p.radius) p.x = -p.radius;
                if (p.y < -p.radius) p.y = canvas.height + p.radius;
                if (p.y > canvas.height + p.radius) p.y = -p.radius;

                // Dibujar aro con glow
                ctx.save();
                ctx.shadowBlur = 8;
                ctx.shadowColor = p.glowColor;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.strokeStyle = p.glowColor
                    .replace(')', `, ${p.opacity})`)
                    .replace('rgb', 'rgba')
                    .replace('#', 'rgba(')
                    // Fallback: usar directamente con globalAlpha
                    ;
                ctx.globalAlpha = p.opacity;
                ctx.strokeStyle = p.glowColor;
                ctx.lineWidth = p.lineWidth;
                ctx.stroke();
                ctx.globalAlpha = 1;
                ctx.restore();

                // Generar texto binario aleatoriamente
                if (Math.random() < CONFIG.binarySpawnRate) {
                    binaryLabels.push({
                        x: p.x + randomBetween(-30, 30),
                        y: p.y + randomBetween(-20, 20),
                        text: randomBinaryString(Math.floor(randomBetween(4, 10))),
                        alpha: 0,
                        life: CONFIG.binaryLifeFrames,
                        maxLife: CONFIG.binaryLifeFrames,
                    });
                }
            }

            // ── Dibujar líneas de conexión ─────────────────────────────────
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i];
                    const b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONFIG.connectionDistance) {
                        // Opacidad inversamente proporcional a la distancia
                        const alpha = CONFIG.lineOpacity * (1 - dist / CONFIG.connectionDistance);
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(100, 180, 255, ${alpha})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                        ctx.restore();
                    }
                }
            }

            // ── Dibujar y actualizar etiquetas binarias ────────────────────
            for (let i = binaryLabels.length - 1; i >= 0; i--) {
                const label = binaryLabels[i];
                label.life--;

                // Fade in rápido, fade out lento
                const progress = label.life / label.maxLife;
                if (progress > 0.8) {
                    label.alpha = (1 - progress) / 0.2; // fade in
                } else {
                    label.alpha = progress / 0.8;       // fade out
                }

                ctx.save();
                ctx.globalAlpha = label.alpha * 0.65; // visible pero sutil
                ctx.font = `9px 'Courier New', monospace`;
                ctx.fillStyle = '#00d4ff';
                ctx.fillText(label.text, label.x, label.y);
                ctx.restore();

                // Eliminar cuando expire
                if (label.life <= 0) {
                    binaryLabels.splice(i, 1);
                }
            }

            animFrameRef.current = requestAnimationFrame(animate);
        }

        animate();

        // ── Limpieza ───────────────────────────────────────────────────────
        return () => {
            cancelAnimationFrame(animFrameRef.current);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
                opacity: 0,                          // oculto por defecto (fondo blanco)
                transition: 'opacity 0.6s ease',     // fade suave al cambiar
            }}
        />
    );
}
