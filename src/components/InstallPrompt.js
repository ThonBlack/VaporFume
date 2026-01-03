'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // DEMO: Check if we are not in standalone mode (i.e., browser)
        const isBrowser = !window.matchMedia('(display-mode: standalone)').matches;
        if (isBrowser) {
            // Force show after 2s for visibility (even if PWA criteria not fully met yet on HTTP)
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            // Fallback for when 'beforeinstallprompt' didn't fire (e.g. iOS or Desktop without support)
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

            if (isIOS) {
                alert("Para instalar no iPhone:\n1. Toque no botão 'Compartilhar' (quadrado com seta)\n2. Role para baixo e toque em 'Adicionar à Tela de Início'");
            } else {
                alert("Para instalar:\n1. Clique nos 3 pontinhos do navegador\n2. Selecione 'Adicionar à Tela Inicial' ou 'Instalar App'");
            }
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-white/95 backdrop-blur-md border border-gray-200 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
                        <img src="/assets/icon-v2.png" alt="App Icon" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-gray-900 leading-tight">Instalar App</p>
                        <p className="text-xs text-gray-500">Vapor Fumê</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <button
                        onClick={handleInstallClick}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/20"
                    >
                        <Download size={16} /> Instalar
                    </button>
                </div>
            </div>
        </div>
    );
}
