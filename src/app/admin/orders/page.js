import { getOrders } from '@/app/actions/orders';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedidos recebidos</h1>
                <p className="text-gray-500 text-sm">Aqui são exibidos seus pedidos recebidos.</p>
                <button className="mt-4 text-blue-500 text-sm font-medium hover:underline flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Adicionar pedido
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {orders.map((order) => (
                    <Link
                        key={order.id}
                        href={`/admin/orders/${order.id}`}
                        className="block bg-white hover:bg-gray-50 transition-colors border-b border-gray-100 pb-4 last:border-0"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{order.customerName}</span>
                                    <span className="text-blue-500 font-medium text-sm">R$ {order.total.toFixed(2)}</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                                        day: '2-digit', month: 'long', year: 'numeric'
                                    })} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Dot indicator */}
                                <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'completed' ? 'bg-green-500' :
                                    order.status === 'pending' ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}></div>
                                <span className="text-xs font-medium text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                    Pagamento a combinar
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}

                {orders.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        Nenhum pedido encontrado.
                    </div>
                )}
            </div>
        </div>
    );
}
