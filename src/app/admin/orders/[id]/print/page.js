import { getOrderById } from '@/app/actions/orders';
import QRCode from 'react-qr-code';
import { notFound } from 'next/navigation';

export default async function PrintOrderPage({ params }) {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) { notFound(); }

    const order = await getOrderById(orderId);

    if (!order) return <div>Pedido não encontrado</div>;

    // QR Data - Rich Content for "Digital Receipt"
    const itemsList = order.items.map(i => `• ${i.quantity}x ${i.productName} ${i.variantName ? `(${i.variantName})` : ''}`).join('\n');
    const qrData = `VAPOR FUMÊ\n----------------\nPedido: #${order.id}\nData: ${new Date(order.createdAt).toLocaleDateString('pt-BR')}\nCliente: ${order.customerName}\n----------------\nITENS:\n${itemsList}\n----------------\nTOTAL: R$ ${order.total.toFixed(2)}\nPagamento: ${order.paymentMethod}`;

    return (
        <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            background: '#fff',
            padding: '0'
        }}>
            <style>{`
                @media print {
                    @page { size: 80mm auto; margin: 0; }
                    body { margin: 0; padding: 0; width: 78mm; }
                    html, body { height: auto; }
                    /* Hide header/footer if possible */
                    header, footer, .no-print { display: none !important; }
                }
            `}</style>

            {/* Wrapper restricted to ~75mm safe area */}
            <div style={{
                width: '100%',
                maxWidth: '75mm',
                padding: '10px 5px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                fontFamily: 'monospace', /* Monospace acts better for receipt vibe */
                boxSizing: 'border-box',
                borderBottom: '1px dashed #000'
            }}>
                {/* Header / Logo */}
                <div style={{ width: '100%', marginBottom: '10px' }}>
                    <div className="w-full flex justify-center mb-2">
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>VAPOR FUMÊ</h1>
                    </div>
                </div>

                {/* Info */}
                <div style={{ marginBottom: '10px' }}>
                    <p style={{ fontSize: '0.9rem', margin: '0' }}>Pedido #{order.id}</p>
                    <p style={{ fontSize: '0.8rem', margin: '0' }}>{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                </div>

                {/* Customer Info */}
                <div style={{ marginBottom: '15px', width: '100%', borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '10px 0' }}>
                    <p style={{ fontSize: '1.2rem', margin: '0', fontWeight: 'bold' }}>
                        {order.customerName}
                    </p>
                    {order.customerPhone && <p style={{ fontSize: '0.9rem', margin: '5px 0 0 0' }}>{order.customerPhone}</p>}
                </div>

                {/* Items HIDDEN from visual, only in QR */}
                <div style={{ width: '100%', textAlign: 'center', marginBottom: '10px', fontStyle: 'italic', fontSize: '0.8rem', color: '#666' }}>
                    * Detalhes dos itens no QR Code *
                    <br />
                    (Design Discreto)
                </div>

                {/* Totals */}
                <div style={{ width: '100%', borderTop: '1px dashed #000', paddingTop: '10px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 'bold' }}>
                        <span>TOTAL</span>
                        <span>R$ {order.total.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.0rem', marginTop: '5px' }}>
                        <span>Pagamento:</span>
                        <span>
                            {order.paymentMethod === 'whatsapp' ? 'A Combinar' :
                                order.paymentMethod === 'mercadopago' ? 'Pix' :
                                    order.paymentMethod === 'cash' ? 'Dinheiro' :
                                        order.paymentMethod === 'credit_card' ? 'Crédito' :
                                            order.paymentMethod === 'debit_card' ? 'Débito' : order.paymentMethod}
                        </span>
                    </div>
                </div>

                {/* QR Code */}
                <div style={{ padding: '0', margin: '0 0 10px 0' }}>
                    <QRCode
                        value={qrData}
                        size={150} // Bigger QR
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                </div>

                {/* Footer */}
                <div style={{ width: '100%' }}>
                    <p style={{ fontSize: '0.8rem', margin: 0 }}>www.vaporfume.com</p>
                    <p style={{ fontSize: '0.8rem', margin: 0 }}>Obrigado pela preferência!</p>
                </div>
            </div>
            <script dangerouslySetInnerHTML={{ __html: 'window.print();' }} />
        </div>
    );
}
