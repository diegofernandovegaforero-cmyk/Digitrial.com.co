'use client';
import { motion } from 'framer-motion';

export default function WavesBackground() {
    return (
        <div className="absolute bottom-0 left-0 w-full h-[200px] overflow-hidden leading-none pointer-events-none -z-0">
            {/* Onda 1 - Más lenta y transparente */}
            <div className="absolute bottom-0 left-0 w-full h-[150px] opacity-[0.3]">
                <svg className="relative block w-[200%] h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <motion.path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                        fill="rgba(230, 245, 255, 0.5)"
                        animate={{ x: ['-50%', '0%'] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    />
                </svg>
            </div>
            {/* Onda 2 - Más rápida y sutil */}
            <div className="absolute bottom-0 left-0 w-full h-[180px] opacity-[0.2]">
                <svg className="relative block w-[200%] h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <motion.path
                        d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
                        fill="rgba(215, 235, 255, 0.6)"
                        animate={{ x: ['0%', '-50%'] }}
                        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    />
                </svg>
            </div>
        </div>
    );
}
