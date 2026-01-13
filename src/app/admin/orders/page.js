import { getOrders } from '@/app/actions/orders';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import DeleteOrderButton from '@/components/DeleteOrderButton';
import ExportOrdersButton from '@/components/ExportOrdersButton';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({ searchParams }) {
    const params = await searchParams;
    const page = parseInt(params?.page || '1');
    const loadLimit = 10;
    const { data: orders, meta } = await getOrders(page, loadLimit);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedidos recebidos</h1>
                    <p className="text-gray-500 text-sm">Página {meta.page} de {meta.totalPages} ({meta.total} pedidos)</p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportOrdersButton />
                    <button className="text-blue-500 text-sm font-medium hover:underline flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Adicionar pedido
                    </button>
                </div>
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
                                <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'completed' ? 'bg-green-500' :
                                    order.status === 'pending' ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}></div>
                                {order.status === 'completed' || order.status === 'paid' ? (
                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                        Pago / Entregue
                                    </span>
                                ) : order.status === 'cancelled' ? (
                                    <span className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                                        Cancelado
                                    </span>
                                ) : (
                                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                        Pendente / Fiado
                                    </span>
                                )}
                                <DeleteOrderButton orderId={order.id} />
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

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-8">
                    {page > 1 && (
                        <a
                            href={`/admin/orders?page=${page - 1}`}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                        >
                            Anterior
                        </a>
                    )}
                    <span className="px-4 py-2 text-sm text-gray-500">
                        {page} / {meta.totalPages}
                    </span>
                    {page < meta.totalPages && (
                        <a
                            href={`/admin/orders?page=${page + 1}`}
                            className="px-4 py-2 border border-blue-600 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-bold transition-colors"
                        >
                            Próxima
                        </a>
                    )}
                </div>
            )}
        </div >
    );
}
