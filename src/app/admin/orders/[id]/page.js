import { getOrderById } from '@/app/actions/orders';
import OrderStatusSelector from '@/components/OrderStatusSelector';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Printer, XCircle, Package, Truck, CheckCircle2, Clock, CreditCard, MapPin, User, Phone } from 'lucide-react';
import { notFound } from 'next/navigation';
import FinalizeOrderButton from '@/components/FinalizeOrderButton';
import SendDeliveryButton from '@/components/SendDeliveryButton';

export default async function OrderDetailsPage({ params }) {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) { notFound(); }

    const order = await getOrderById(orderId);

    if (!order) return <div>Pedido não encontrado</div>;

    // Status config com cores e ícones
    const statusConfig = {
        pending: { label: 'Aguardando Pagamento', color: 'yellow', icon: Clock },
        paid: { label: 'Pago', color: 'blue', icon: CreditCard },
        shipped: { label: 'Enviado', color: 'purple', icon: Truck },
        completed: { label: 'Entregue', color: 'green', icon: CheckCircle2 },
        cancelled: { label: 'Cancelado', color: 'red', icon: XCircle }
    };

    const status = statusConfig[order.status] || statusConfig.pending;
    const StatusIcon = status.icon;

    // Parse address safely
    let addressFormatted = 'Endereço não informado';
    if (order.address) {
        try {
            const addr = JSON.parse(order.address);
            addressFormatted = `${addr.street}, ${addr.number} - ${addr.neighborhood}, ${addr.city}${addr.cep ? ` - ${addr.cep}` : ''}`;
        } catch {
            addressFormatted = order.address;
        }
    }

    // Payment method display
    const paymentLabels = {
        cash: 'Dinheiro',
        pix: 'Pix',
        credit_card: 'Cartão de Crédito',
        fiado: 'Fiado',
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/admin/orders" className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-bold text-gray-900">Pedido #{order.id}</h1>
                    <div className="w-9"></div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-6 space-y-4">
                {/* Status Card */}
                <div className={`bg-${status.color}-50 border border-${status.color}-200 rounded-2xl p-6`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 bg-${status.color}-100 rounded-xl flex items-center justify-center`}>
                            <StatusIcon className={`w-7 h-7 text-${status.color}-600`} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-500">Status do Pedido</p>
                            <p className={`text-xl font-bold text-${status.color}-700`}>{status.label}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                        Criado em {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                </div>

                {/* Value Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Total do Pedido</span>
                        <span className="text-3xl font-bold text-gray-900">R$ {order.total.toFixed(2)}</span>
                    </div>
                    {order.paymentMethod && (
                        <p className="text-sm text-gray-400 mt-2">
                            Pagamento: {paymentLabels[order.paymentMethod] || order.paymentMethod}
                        </p>
                    )}
                </div>

                {/* Products */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-gray-400" />
                        Produtos ({order.items.length})
                    </h3>
                    <div className="space-y-3">
                        {order.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                <div>
                                    <p className="font-medium text-gray-900">{item.productName}</p>
                                    {item.variantName && (
                                        <p className="text-sm text-gray-500">{item.variantName}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                    <p className="text-xs text-gray-400">{item.quantity}x R$ {item.price.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Customer */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" />
                        Cliente
                    </h3>
                    <div className="space-y-3">
                        <p className="font-semibold text-gray-900 text-lg">{order.customerName}</p>
                        {order.customerPhone && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4" />
                                {order.customerPhone}
                            </div>
                        )}
                        {order.customerEmail && order.customerEmail !== 'pdv@loja.com' && (
                            <p className="text-sm text-gray-500">{order.customerEmail}</p>
                        )}
                    </div>
                </div>

                {/* Address */}
                {order.address && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            Endereço de Entrega
                        </h3>
                        <p className="text-gray-600">{addressFormatted}</p>
                    </div>
                )}

                {/* Status Selector */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2">Alterar Status</h3>
                    <p className="text-xs text-gray-500 mb-4">
                        O cliente será notificado quando você alterar o status.
                    </p>
                    <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                    <a
                        href={`https://wa.me/55${order.customerPhone ? order.customerPhone.replace(/\D/g, '') : ''}?text=Olá ${order.customerName}, tudo bem? Sobre seu pedido #${order.id}...`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-colors"
                    >
                        <MessageCircle className="w-5 h-5" />
                        WhatsApp ({order.customerPhone})
                    </a>

                    <SendDeliveryButton
                        orderId={order.id}
                        printUrl={`/admin/orders/${order.id}/print`}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href={`/admin/orders/${order.id}/print`}
                            target="_blank"
                            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl border border-gray-200 transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            Imprimir
                        </Link>

                        {order.status !== 'completed' && (
                            <FinalizeOrderButton orderId={order.id} />
                        )}
                    </div>

                    {order.status !== 'cancelled' && (
                        <button className="flex items-center justify-center gap-2 w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 rounded-xl transition-colors border border-red-100">
                            <XCircle className="w-4 h-4" />
                            Cancelar Pedido
                        </button>
                    )}
                </div>

                {/* Track Link */}
                <div className="text-center pt-4">
                    <Link
                        href={`/track/${order.id}`}
                        target="_blank"
                        className="text-blue-600 text-sm hover:underline"
                    >
                        Ver página de acompanhamento do cliente →
                    </Link>
                </div>
            </div>
        </div>
    );
}
