'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getOrderById } from '@/app/actions/orders';
import { Loader2, Package, CheckCircle2, MessageCircle, MapPin } from 'lucide-react';

export default function TrackOrderPage() {
    const params = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

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
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#00ff00] animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
                <h1 className="text-xl font-bold mb-2">Pedido não encontrado</h1>
                <p className="text-gray-400">Verifique o link ou o QR Code.</p>
            </div>
        );
    }

    const statusMap = {
        'pending': { label: 'Aguardando Pagamento', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        'paid': { label: 'Pago / Preparaçao', color: 'text-[#00ff00]', bg: 'bg-[#00ff00]/10' },
        'shipped': { label: 'Enviado', color: 'text-blue-400', bg: 'bg-blue-400/10' },
        'delivered': { label: 'Entregue', color: 'text-green-500', bg: 'bg-green-500/10' },
        'canceled': { label: 'Cancelado', color: 'text-red-500', bg: 'bg-red-500/10' }
    };

    const status = statusMap[order.status] || { label: order.status, color: 'text-gray-400', bg: 'bg-gray-800' };

    return (
        <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-[#00ff00] selection:text-black">
            {/* Header / Brand */}
            <div className="border-b border-gray-800 p-6 flex justify-center">
                <h1 className="text-2xl font-bold tracking-widest text-white">VAPOR <span className="text-[#00ff00]">FUMÊ</span></h1>
            </div>

            <main className="max-w-md mx-auto p-6 pb-20">

                {/* Status Card */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-8 text-center backdrop-blur-sm">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                        <Package className={`w-8 h-8 ${status.color}`} />
                    </div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Status do Pedido</p>
                    <h2 className={`text-xl font-bold ${status.color ? status.color : 'text-white'}`}>{status.label}</h2>
                    <p className="text-xs text-gray-600 mt-2">Atualizado em {new Date(order.updatedAt || order.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>

                {/* Order Details */}
                <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-gray-800 pb-2">
                        <h3 className="text-[#00ff00] font-semibold text-sm uppercase tracking-wider">Itens do Pedido</h3>
                        <span className="text-xs text-gray-500">#{order.id}</span>
                    </div>

                    <div className="space-y-4">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-center bg-gray-900/30 p-3 rounded-xl border border-gray-800/50">
                                <div className="w-12 h-12 bg-gray-800 rounded-lg flex-shrink-0 relative overflow-hidden">
                                    {/* Use product image if available (needs joining product table ideally, or saving image in orderItem) 
                                         Currently using placeholder or if we saved image url in item (we didn't, usually just productId).
                                         We will use a generic placeholder for now as we didn't join product image in getOrderById deep enough or save it.
                                         Wait, getOrderById DOES include product: true. So we can access item.product.images
                                     */}
                                    {item.product?.images ? (
                                        <img src={JSON.parse(item.product.images)[0] || '/assets/ref-mobile.jpg'} className="w-full h-full object-cover opacity-80" alt="" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-700" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-medium text-sm">{item.productName}</h4>
                                    {item.variantName && <p className="text-xs text-gray-500">{item.variantName}</p>}
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-medium text-sm">x{item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-sm">Entrega</span>
                            <span className="text-white text-sm font-medium">
                                {order.shippingCost ? `R$ ${order.shippingCost.toFixed(2)}` : 'Grátis'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                            <span className="text-gray-400">Total</span>
                            <span className="text-2xl font-bold text-white">R$ {order.total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Customer & Address */}
                    <div className="space-y-4 pt-6">
                        <h3 className="text-[#00ff00] font-semibold text-sm uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Entrega</h3>
                        <div className="flex gap-3 text-gray-400 text-sm">
                            <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0" />
                            <div>
                                <p className="text-white font-medium">{order.customerName}</p>
                                <p>{order.customerAddress}</p>
                                <p>{order.customerCity} - {order.customerState}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                    <a
                        href={`https://wa.me/55${order.whatsapp_number || '34991919191'}?text=Olá, estou vendo meu pedido #${order.id} no site.`}
                        target="_blank"
                        className="w-full max-w-md mx-auto bg-[#00ff00] hover:bg-[#00cc00] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Fale Conosco
                    </a>
                </div>

            </main>
        </div>
    );
}
