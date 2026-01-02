'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const loadCart = () => {
            const saved = JSON.parse(localStorage.getItem('cart') || '[]');
            setCart(saved);
        };
        loadCart();
        setMounted(true);

        // Listen for updates in case header changes it (rare but good practice)
        window.addEventListener('cart-updated', loadCart);
        return () => window.removeEventListener('cart-updated', loadCart);
    }, []);

    useEffect(() => {
        const t = cart.reduce((acc, item) => acc + item.price, 0);
        setTotal(t);
    }, [cart]);

    const removeItem = (uniqueId) => {
        const newCart = cart.filter(item => item.uniqueId !== uniqueId);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cart-updated'));
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header />

            <main className="container mx-auto px-4 pt-24 max-w-2xl">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6" /> Seu Carrinho
                </h1>

                {cart.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Sua cesta está vazia</h2>
                        <p className="text-gray-500 mb-8">Navegue pela loja e adicione produtos.</p>
                        <Link href="/">
                            <button className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all">
                                Começar a Comprar
                            </button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="space-y-4 mb-8">
                            {cart.map((item) => (
                                <div key={item.uniqueId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center animate-in slide-in-from-bottom-2">
                                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={item.image || '/assets/ref-mobile.jpg'} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 line-clamp-1">{item.productName}</h3>
                                        <p className="text-sm text-gray-500">
                                            {item.variants && item.variants.length > 0
                                                ? item.variants.join(', ')
                                                : item.isKit ? 'Kit Personalizado' : 'Padrão'}
                                        </p>
                                        <p className="text-sm font-bold mt-1">R$ {item.price.toFixed(2)}</p>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.uniqueId)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-2xl font-bold text-gray-900">R$ {total.toFixed(2)}</span>
                            </div>

                            <div className="grid gap-3">
                                <Link href="/checkout">
                                    <button className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                                        Finalizar Compra <ArrowRight size={20} />
                                    </button>
                                </Link>

                                <Link href="/">
                                    <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                                        <ArrowLeft size={18} /> Continuar Comprando
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
