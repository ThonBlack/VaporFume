'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { ShoppingBag, Heart, LogOut, User } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
    const [phone, setPhone] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('user_phone');
        if (saved) setPhone(saved);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user_phone');
        setPhone('');
        alert('Desconectado deste dispositivo.');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header />

            <main className="container pt-24 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>
                    {phone && (
                        <button onClick={handleLogout} className="text-red-500 text-sm font-medium flex items-center gap-1">
                            <LogOut size={16} /> Sair
                        </button>
                    )}
                </div>

                {/* Profile Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <User size={32} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Logado como</p>
                        <p className="font-bold text-lg text-gray-900">{phone || 'Visitante'}</p>
                    </div>
                </div>

                {/* Grid Menu */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/favorites">
                        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Heart size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Meus Favoritos</h3>
                                <p className="text-sm text-gray-500">Produtos salvos e listas de desejo</p>
                            </div>
                        </div>
                    </Link>

                    {/* Orders Stub - You previously had logic for orders using phone, could link to a detailed page */}
                    <Link href="/admin/orders">
                        {/* Ideally this should be a client-facing order list, reusing admin logic for now or needs new page */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ShoppingBag size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Meus Pedidos</h3>
                                <p className="text-sm text-gray-500">Acompanhe suas compras</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {!phone && (
                    <div className="mt-8 p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm">
                        💡 Dica: Salve um produto nos favoritos para identificar seu WhatsApp.
                    </div>
                )}
            </main>
        </div>
    );
}
