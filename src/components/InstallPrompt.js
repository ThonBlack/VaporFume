'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // DEMO MODE: Force show for visual testing (User request)
        // In production, rely on 'beforeinstallprompt'
        // setTimeout(() => setIsVisible(true), 2000);

        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            // Only show if not already installed (checked by standalone mode or similar)
            if (!window.matchMedia('(display-mode: standalone)').matches) {
                setIsVisible(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert("A instalação não está disponível no momento. Pode ser que o app já esteja instalado ou o navegador não suporte.");
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-white/90 backdrop-blur-md border border-gray-200 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center overflow-hidden">
                        <img src="/assets/logo-custom.png" alt="App Icon" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-gray-900">Instalar App</p>
                        <p className="text-xs text-gray-500">Acesso rápido e offline</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                    <button
                        onClick={handleInstallClick}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-all"
                    >
                        <Download size={16} /> Instalar
                    </button>
                </div>
            </div>
        </div>
    );
}
