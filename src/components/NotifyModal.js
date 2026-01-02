'use client';

import { useState } from 'react';
import { X, Bell, Loader2, Heart } from 'lucide-react';
import { saveRestockSubscription, saveFavorite } from '@/app/actions/marketing';

export default function NotifyModal({ isOpen, onClose, product, variant, mode = 'restock' }) {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Load phone from storage
    if (isOpen && !phone && typeof window !== 'undefined') {
        const saved = localStorage.getItem('user_phone');
        if (saved) setPhone(saved);
    }

    if (!isOpen) return null;

    const isFavorite = mode === 'favorite';
    const title = isFavorite ? 'Salvar nos Favoritos' : 'Avise-me quando chegar';
    const message = isFavorite
        ? `Salve este produto na sua lista VIP! 💎\nVocê garante prioridade em Ofertas Relâmpago e Avisos de Reposição.`
        : `O produto ${product.name} - ${variant} está esgotado. Preencha abaixo para receber um alerta.`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Save for next time
            if (typeof window !== 'undefined') localStorage.setItem('user_phone', phone);

            // Simulate action for now, or call the real one if we had it ready
            // await saveRestockSubscription({ productId: product.id, variantName: variant, email, phone });

            // Temporary Simulation -> User asked for logic first
            await new Promise(r => setTimeout(r, 1000));

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2500);
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-800">
                        {isFavorite ? <Heart className="text-red-500 fill-red-500" size={20} /> : <Bell size={20} className="text-yellow-500" />}
                        <h3 className="font-bold">{title}</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in">
                            <div className={`w-16 h-16 ${isFavorite ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'} rounded-full flex items-center justify-center mb-4`}>
                                {isFavorite ? <Heart size={32} className="fill-current" /> : <Bell size={32} />}
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">{isFavorite ? 'Favorito Salvo!' : 'Aviso Confirmado!'}</h4>
                            <p className="text-gray-600">
                                {isFavorite ? 'Vamos te avisar das melhores ofertas.' : 'Assim que chegar, nós te avisamos!'} 🚀
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <p className="text-sm text-gray-600 mb-2">
                                {message}
                            </p>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">WhatsApp</label>
                                <input
                                    type="tel"
                                    placeholder="(11) 99999-9999"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-black outline-none transition-all"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">E-mail (Opcional)</label>
                                <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-black outline-none transition-all"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !phone}
                                className="mt-2 bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Me Avise! 🔔'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
