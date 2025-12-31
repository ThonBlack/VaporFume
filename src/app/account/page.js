'use client';

import { useState } from 'react';
import { getMyOrders } from '@/app/actions/customer';
import { Loader2, Search, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setOrders(null);

        const res = await getMyOrders(phone);

        if (res.success) {
            setOrders(res.orders);
            if (res.orders.length === 0) {
                setError('Nenhum pedido encontrado com este número.');
            }
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    const statusMap = {
        'pending': { label: 'Aguardando', color: 'text-yellow-400', border: 'border-yellow-400/20' },
        'paid': { label: 'Em Preparação', color: 'text-[#00ff00]', border: 'border-[#00ff00]/20' },
        'shipped': { label: 'Enviado', color: 'text-blue-400', border: 'border-blue-400/20' },
        'delivered': { label: 'Entregue', color: 'text-green-500', border: 'border-green-500/20' },
        'canceled': { label: 'Cancelado', color: 'text-red-500', border: 'border-red-500/20' }
    };

    return (
        <div className="min-h-screen bg-black text-gray-200 font-sans">
            {/* Header */}
            <div className="border-b border-gray-800 p-6 flex justify-between items-center">
                <Link href="/">
                    <img src="/assets/logo-main.png" alt="Vapor Fume" className="h-10 object-contain" />
                </Link>
                <Link href="/" className="text-sm text-gray-500 hover:text-white">Voltar a Loja</Link>
            </div>

            <main className="max-w-md mx-auto p-6 md:mt-10">
                <h1 className="text-2xl font-bold text-white mb-2">Meus Pedidos</h1>
                <p className="text-gray-500 mb-8 text-sm">Acesse seu histórico usando seu telefone.</p>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="mb-10">
                    <div className="relative">
                        <input
                            type="tel"
                            placeholder="Seu telefone (DDD + Número)"
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 pl-12 text-white outline-none focus:border-[#00ff00] focus:ring-1 focus:ring-[#00ff00] transition-all placeholder:text-gray-600"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <button
                            type="submit"
                            disabled={loading || phone.length < 8}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#00ff00] text-black rounded-lg p-2 disabled:opacity-50 hover:bg-[#00cc00] transition-colors"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-3 ml-1 animate-in slide-in-from-top-1">{error}</p>}
                </form>

                {/* Results List */}
                {orders && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        {orders.map(order => {
                            const st = statusMap[order.status] || { label: order.status, color: 'text-gray-400', border: 'border-gray-800' };
                            return (
                                <Link href={`/track/${order.id}`} key={order.id} className={`block bg-gray-900/50 border ${st.border} p-4 rounded-xl hover:bg-gray-800 transition-all group`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${st.color} bg-black/30 px-2 py-1 rounded`}>
                                                {st.label}
                                            </span>
                                            <p className="text-gray-500 text-xs mt-2">{new Date(order.createdAt).toLocaleDateString('pt-BR')} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <span className="text-gray-400 text-xs group-hover:text-white">#{order.id}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex -space-x-2">
                                            {/* Minimal Item Preview (Icons) */}
                                            {order.items.slice(0, 3).map((_, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-500">
                                                    <Package className="w-4 h-4" />
                                                </div>
                                            ))}
                                            {order.items.length > 3 && (
                                                <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs text-gray-400">
                                                    +{order.items.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <p className="font-bold text-white">R$ {order.total.toFixed(2)}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
