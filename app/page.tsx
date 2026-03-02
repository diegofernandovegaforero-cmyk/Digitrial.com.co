'use client';
import { useRef } from "react";
import Navbar from "@/components/Navbar";
import { HeroHeader, HeroSearch } from "@/components/Hero";
import Templates from "@/components/Templates";
import Footer from "@/components/Footer";
import VideoBackground from "@/components/VideoBackground";
import { MessageCircle } from "lucide-react";

export default function Home() {
    const videoRangeRef = useRef<HTMLDivElement>(null);

    return (
        <main className="relative">
            <VideoBackground targetRef={videoRangeRef} />
            <Navbar />
            <div ref={videoRangeRef} className="relative">
                <HeroHeader />
                <HeroSearch />
                <div className="h-[40vh] bg-transparent" />
            </div>
            <Templates />
            <Footer />

            {/* Floating WhatsApp Button */}
            <a
                href="https://wa.me/573123299053"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 bg-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-green-500 border border-gray-100 hover:scale-110 transition-transform z-50 group"
                aria-label="Contactar por WhatsApp"
            >
                <MessageCircle className="w-8 h-8 fill-green-500 text-green-500 group-hover:animate-pulse" />
            </a>
        </main>
    );
}

