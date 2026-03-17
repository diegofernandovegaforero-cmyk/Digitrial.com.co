'use client';
import { useRef } from "react";
import Navbar from "@/components/Navbar";
import { HeroHeader, HeroSearch } from "@/components/Hero";
import Templates from "@/components/Templates";
import Footer from "@/components/Footer";
import VideoBackground from "@/components/VideoBackground";

import About from '@/components/About';
import DigitChat from '@/components/DigitChat';

export default function Home() {
    const videoRangeRef = useRef<HTMLDivElement>(null);

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            <VideoBackground targetRef={videoRangeRef} />
            <Navbar />
            <div className="relative z-40 bg-transparent transition-colors duration-300">
                <HeroHeader />
                <HeroSearch />
            </div>
            <div ref={videoRangeRef} className="h-[150vh] bg-transparent" />
            <div className="relative z-50 bg-white dark:bg-slate-950">
                <Templates />
                <About />
                <Footer />
            </div>

            {/* AI Assistant DIGIT */}
            <DigitChat />
        </main>
    );
}

