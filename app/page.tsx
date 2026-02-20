'use client';
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Footer from "@/components/Footer";
import { MessageCircle } from "lucide-react";

export default function Home() {
    return (
        <main className="relative z-10">
            <Navbar />
            <Hero />
            <Services />
            <About />
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

