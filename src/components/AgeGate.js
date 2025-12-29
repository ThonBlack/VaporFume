'use client';

import { useState, useEffect } from 'react';

export default function AgeGate() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check local storage
        const ageVerified = localStorage.getItem('vapor_age_verified');
        if (!ageVerified) {
            setIsVisible(true);
        }
    }, []);

    const handleYes = () => {
        localStorage.setItem('vapor_age_verified', 'true');
        setIsVisible(false);
    };

    const handleNo = () => {
        window.location.href = 'https://www.google.com';
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold">18+</span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificação de Idade</h2>
                <p className="text-gray-600 mb-8">
                    Este site contém produtos destinados apenas para maiores de 18 anos. Você é maior de idade?
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleYes}
                        className="w-full bg-black text-white h-12 rounded-xl font-bold hover:bg-gray-800 transition-all"
                    >
                        SIM, SOU MAIOR DE 18
                    </button>
                    <button
                        onClick={handleNo}
                        className="w-full bg-gray-100 text-gray-600 h-12 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                    >
                        NÃO, SAIR DO SITE
                    </button>
                </div>
                <p className="mt-6 text-xs text-gray-400">
                    Ao entrar, você concorda com nossos termos.
                </p>
            </div>
        </div>
    );
}
