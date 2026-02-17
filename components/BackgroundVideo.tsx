'use client';
import { useEffect, useRef, useState } from 'react';

export default function BackgroundVideo() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [videoLoaded, setVideoLoaded] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Video load handler
        const handleLoadedData = () => {
            console.log('Video loaded successfully, duration:', video.duration);
            setVideoLoaded(true);
        };

        const handleError = (e: Event) => {
            console.error('Video failed to load:', e);
        };

        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('error', handleError);

        // Ensure video is loaded
        video.load();

        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (!video) return;

                    // Calculate scroll progress (0 to 1)
                    const scrollTop = window.scrollY;
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                    const scrollProgress = Math.min(scrollTop / docHeight, 1);

                    // Sync video time with scroll progress
                    if (video.duration && !isNaN(video.duration)) {
                        video.currentTime = video.duration * scrollProgress;
                    }

                    ticking = false;
                });

                ticking = true;
            }
        };

        // Initial position
        handleScroll();

        // Add scroll listener
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('error', handleError);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
            style={{
                opacity: 0.4, // Increased for visibility
                mixBlendMode: 'soft-light'
            }}
        >
            <video
                ref={videoRef}
                className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
                muted
                playsInline
                preload="auto"
            >
                <source src="/videos/background-watermark.mp4.mp4" type="video/mp4" />
            </video>
            {videoLoaded && (
                <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    Video Loaded
                </div>
            )}
        </div>
    );
}
