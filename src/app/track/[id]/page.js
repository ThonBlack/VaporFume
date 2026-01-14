'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getOrderById } from '@/app/actions/orders';
import { Loader2, Package, CheckCircle2, Truck, Home, Clock, MessageCircle, MapPin, Copy, Check, ShoppingBag } from 'lucide-react';

export default function TrackOrderPage() {
    const params = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (params.id) {
            getOrderById(parseInt(params.id))
                .then(data => {
                    setOrder(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">Carregando pedido...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col items-center justify-center p-4">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <Package className="w-10 h-10 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Pedido não encontrado</h1>
                <p className="text-gray-400">Verifique o link ou entre em contato.</p>
            </div>
        );
    }

    // Status timeline steps
    const steps = [
        { key: 'pending', label: 'Pedido Recebido', icon: ShoppingBag },
        { key: 'paid', label: 'Pagamento Confirmado', icon: CheckCircle2 },
        { key: 'shipped', label: 'Saiu para Entrega', icon: Truck },
        { key: 'completed', label: 'Entregue', icon: Home },
    ];

    const statusOrder = ['pending', 'paid', 'shipped', 'completed'];
    const currentIdx = statusOrder.indexOf(order.status);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Parse address safely
    let addressStr = '';
    if (order.address) {
        try {
            const addr = JSON.parse(order.address);
            addressStr = `${addr.street}, ${addr.number} - ${addr.neighborhood}, ${addr.city}`;
        } catch {
            addressStr = order.address;
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-200 font-sans">
            {/* Header */}
            <div className="bg-black/40 backdrop-blur-xl border-b border-white/5 p-6 sticky top-0 z-10">
                <div className="max-w-lg mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold tracking-wide">
                        <span className="text-white">VAPOR</span>
                        <span className="text-emerald-400"> FUMÊ</span>
                    </h1>
                    <span className="text-xs bg-white/10 px-3 py-1.5 rounded-full text-gray-400">
                        #{order.id}
                    </span>
                </div>
            </div>

            <main className="max-w-lg mx-auto p-6 pb-32">
                {/* Status Hero */}
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 border border-white/10 rounded-3xl p-8 mb-8">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />

                    <div className="relative text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20 rotate-3 hover:rotate-0 transition-transform">
                            {order.status === 'completed' ? (
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            ) : order.status === 'shipped' ? (
                                <Truck className="w-10 h-10 text-white" />
                            ) : (
                                <Package className="w-10 h-10 text-white" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                            {order.status === 'pending' && 'Aguardando Pagamento'}
                            {order.status === 'paid' && 'Preparando seu Pedido'}
                            {order.status === 'shipped' && 'Saiu para Entrega! 🚀'}
                            {order.status === 'completed' && 'Pedido Entregue! ✅'}
                            {order.status === 'canceled' && 'Pedido Cancelado'}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>

                {/* Timeline */}
                {order.status !== 'canceled' && (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Acompanhamento</h3>
                        <div className="space-y-1">
                            {steps.map((step, idx) => {
                                const isActive = idx <= currentIdx;
                                const isCurrent = idx === currentIdx;
                                const Icon = step.icon;

                                return (
                                    <div key={step.key} className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${isCurrent ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30 scale-110' :
                                                    isActive ? 'bg-emerald-500/20' : 'bg-white/5'
                                                }`}>
                                                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-gray-600'}`} />
                                            </div>
                                            {idx < steps.length - 1 && (
                                                <div className={`w-0.5 h-8 my-1 rounded-full ${isActive ? 'bg-emerald-500/50' : 'bg-white/10'}`} />
                                            )}
                                        </div>
                                        <div className="pt-2">
                                            <p className={`font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                                {step.label}
                                            </p>
                                            {isCurrent && (
                                                <p className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Etapa atual
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Items */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Seus Produtos</h3>
                    <div className="space-y-3">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-black/20 p-3 rounded-xl">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium text-sm truncate">{item.productName}</p>
                                    {item.variantName && (
                                        <p className="text-xs text-gray-500">{item.variantName}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-semibold">x{item.quantity}</p>
                                    <p className="text-xs text-gray-500">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="border-t border-white/10 mt-4 pt-4 flex justify-between items-center">
                        <span className="text-gray-400">Total</span>
                        <span className="text-2xl font-bold text-white">R$ {order.total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Address */}
                {addressStr && (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Endereço de Entrega</h3>
                        <div className="flex gap-3">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium">{order.customerName}</p>
                                <p className="text-sm text-gray-400">{addressStr}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pix Code (if pending) */}
                {order.status === 'pending' && order.pixCode && (
                    <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6 mb-8">
                        <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Aguardando Pix
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">Copie o código abaixo e pague no seu banco:</p>
                        <div className="bg-black/30 rounded-xl p-4 flex items-center gap-3">
                            <code className="flex-1 text-xs text-gray-300 break-all font-mono">{order.pixCode}</code>
                            <button
                                onClick={() => copyToClipboard(order.pixCode)}
                                className="bg-yellow-500 hover:bg-yellow-400 text-black p-2 rounded-lg transition-colors flex-shrink-0"
                            >
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Fixed WhatsApp Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent">
                <a
                    href={`https://wa.me/5534991919191?text=Olá! Preciso de ajuda com meu pedido %23${order.id}`}
                    target="_blank"
                    className="w-full max-w-lg mx-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                    <MessageCircle className="w-5 h-5" />
                    Falar no WhatsApp
                </a>
            </div>
        </div>
    );
}
