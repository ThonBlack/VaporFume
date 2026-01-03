import { getOrderById } from '@/app/actions/orders';
import OrderStatusSelector from '@/components/OrderStatusSelector';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Printer, XCircle, Instagram, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import FinalizeOrderButton from '@/components/FinalizeOrderButton';

export default async function OrderDetailsPage({ params }) {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) { notFound(); }

    const order = await getOrderById(orderId);

    if (!order) return <div>Pedido não encontrado</div>;

    return (
        <div className="p-6 max-w-2xl mx-auto pb-20">
            {/* Header with Back Button */}
            <div className="mb-8 flex items-center">
                <Link href="/admin/orders" className="p-2 -ml-2 text-gray-400 hover:text-gray-900">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="mx-auto font-medium text-gray-900">Detalhes do pedido</div>
                <div className="w-9"></div> {/* Spacer for centering */}
            </div>

            {/* Main Content */}
            <div className="space-y-10 bg-white p-2">
                {/* Order Header Info */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">#{order.id.toString().toUpperCase()}</h1>
                        <p className="text-xs text-gray-400 mt-1">
                            {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                                day: 'numeric', month: 'long', year: 'numeric'
                            })} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="inline-block bg-amber-50 text-amber-600 border border-amber-100 text-xs px-3 py-1 rounded font-medium">
                            Pagamento a combinar
                        </span>
                    </div>
                </div>

                {/* Totals */}
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900">R$ {order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-base -mt-6">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">R$ {order.total.toFixed(2)}</span>
                </div>

                {/* Products List */}
                <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-900 uppercase mb-4">Produtos</h3>
                    <div className="space-y-3">
                        {order.items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <div className="text-blue-500 hover:underline cursor-pointer">
                                    {item.quantity} x {item.productName} {item.variantName ? `(${item.variantName})` : ''}
                                </div>
                                <div className="text-gray-500">
                                    R$ {(item.price * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Customer Data */}
                <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-900 uppercase mb-4">Dados do comprador</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        <p>34984052289 <span className="text-blue-500 cursor-pointer">Chamar no whatsapp</span></p>
                        <p>{order.customerEmail}</p>
                    </div>
                </div>

                {/* Delivery Info */}
                <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-900 uppercase mb-4">Como deseja receber o produto?</h3>
                    <p className="text-sm text-gray-600">Entrega</p>
                </div>

                {/* Address */}
                <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-900 uppercase mb-4">Endereço</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Rua Honorato Pires França, 801, Ap 33 bloco a torre 3, Jardim do Lago, Uberaba - Mg<br />
                        38081515
                    </p>
                </div>

                {/* Payment Method */}
                <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-900 uppercase mb-4">Forma de pagamento</h3>
                    <p className="text-sm text-gray-600">Combinar via Whatsapp</p>
                </div>

                {/* Status Section */}
                <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-900 uppercase mb-4">Status do pedido</h3>
                    <p className="text-xs text-gray-500 mb-6">
                        Informe para seu cliente sobre o andamento do pedido. Seu cliente receberá um e-mail sempre que você alterar o status.
                    </p>

                    <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
                </div>

                {/* Actions */}
                <div className="pt-10 space-y-3">
                    <h3 className="text-xs font-bold text-gray-900 mb-2">Opções</h3>

                    <a
                        href={`https://wa.me/5534984052289?text=Olá ${order.customerName}, tudo bem? Sobre o seu pedido #${order.id}...`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full bg-gray-50 hover:bg-gray-100 text-gray-800 font-medium py-3 rounded-lg transition-colors border border-gray-200"
                    >
                        <div className="w-5 h-5 rounded-full border border-gray-800 flex items-center justify-center text-[10px]">W</div>
                        Chamar no Whatsapp
                    </a>

                    <Link
                        href={`/admin/orders/${order.id}/print`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-colors shadow-sm border border-gray-200"
                    >
                        <Printer className="w-4 h-4" />
                        Imprimir Cupom
                    </Link>

                    {/* Finalize Button */}
                    {order.status !== 'completed' && (
                        <FinalizeOrderButton orderId={order.id} />
                    )}

                    <button className="flex items-center justify-center gap-2 w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 rounded-lg transition-colors border border-red-100">
                        <XCircle className="w-4 h-4" />
                        Cancelar pedido
                    </button>
                </div>

                <div className="pt-10 text-center text-blue-500 flex justify-center gap-2 items-center cursor-pointer text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Marcar como não lido
                </div>

            </div>
        </div>
    );
}
