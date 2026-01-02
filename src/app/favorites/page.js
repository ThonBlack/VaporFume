'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { getFavorites } from '@/lib/actions';
import { Heart, Loader2, ArrowRight } from 'lucide-react';

export default function FavoritesPage() {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const results = await getFavorites(phone);
            setProducts(results);
            setHasSearched(true);
        } catch (error) {
            console.error(error);
            alert('Erro ao buscar favoritos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header />

            <main className="container pt-24 px-4">
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="text-red-500 fill-red-500" size={28} />
                    <h1 className="text-2xl font-bold text-gray-900">Meus Favoritos</h1>
                </div>

                {!hasSearched ? (
                    // Login State
                    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm text-center mt-10">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart size={32} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Identifique-se</h2>
                        <p className="text-gray-500 mb-6 text-sm">
                            Digite seu WhatsApp para acessar sua lista de desejos e ofertas exclusivas.
                        </p>
                        <form onSubmit={handleSearch} className="flex flex-col gap-3">
                            <input
                                type="tel"
                                placeholder="Seu WhatsApp (11) 9..."
                                className="p-4 border border-gray-200 rounded-xl text-center text-lg font-medium outline-none focus:border-red-500 transition-colors"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading || !phone}
                                className="bg-red-500 text-white font-bold py-4 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <>Acessar <ArrowRight size={20} /></>}
                            </button>
                        </form>
                    </div>
                ) : (
                    // Results State
                    <div>
                        {products.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-gray-400 text-lg">Nenhum favorito encontrado para este número.</p>
                                <button onClick={() => setHasSearched(false)} className="mt-4 text-red-500 font-bold hover:underline">
                                    Tentar outro número
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {products.map(p => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
