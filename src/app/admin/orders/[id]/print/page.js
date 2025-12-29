import { getOrderById } from '@/app/actions/orders';
import { notFound } from 'next/navigation';

export default async function PrintOrderPage({ params }) {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) { notFound(); }

    const order = await getOrderById(orderId);

    if (!order) return <div>Pedido não encontrado</div>;

    // A simple, thermal-printer friendly layout
    // 80mm width approx 300px-ish, usually standard is just full width of viewport but let's constrain it for preview
    return (
        <div className="font-mono text-sm leading-tight p-4 max-w-[300px] mx-auto print:max-w-none print:w-full">
            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { margin: 0.5cm; }
                }
            `}</style>

            <div className="text-center mb-4">
                <h1 className="font-bold text-lg uppercase">Vapor Fumê</h1>
                <p>Top Vapes & Pods</p>
                <p>================================</p>
            </div>

            <div className="mb-4">
                <p>Pedido: #{order.id}</p>
                <p>Data: {new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                <p>Cliente: {order.customerName}</p>
                {order.customerPhone && <p>Tel: {order.customerPhone}</p>}
            </div>

            <p className="mb-2 border-b border-black pb-1">PRODUTOS</p>

            <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                    <div key={idx}>
                        <div className="flex justify-between">
                            <span>{item.quantity}x {item.productName}</span>
                            <span>{(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                        {item.variantName && (
                            <div className="text-[10px] pl-2">- {item.variantName}</div>
                        )}
                    </div>
                ))}
            </div>

            <p className="border-t border-black pt-2 flex justify-between font-bold text-base">
                <span>TOTAL</span>
                <span>R$ {order.total.toFixed(2)}</span>
            </p>

            <div className="mt-8 text-center text-xs">
                <p>Obrigado pela preferência!</p>
                <p>Volte Sempre</p>
            </div>

            <script dangerouslySetInnerHTML={{ __html: 'window.print();' }} />
        </div>
    );
}
