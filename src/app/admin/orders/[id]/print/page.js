import { getOrderById } from '@/app/actions/orders';
import QRCode from 'react-qr-code';
import { notFound } from 'next/navigation';

export default async function PrintOrderPage({ params }) {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) { notFound(); }

    const order = await getOrderById(orderId);

    if (!order) return <div>Pedido não encontrado</div>;

    // QR Data
    const qrData = `Pedido #${order.id}\nCli: ${order.customerName}\nTotal: R$ ${order.total.toFixed(2)}\n${order.items.map(i => `${i.quantity}x ${i.productName}`).join('\n')}`;

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
                fontFamily: 'sans-serif',
                boxSizing: 'border-box',
                borderBottom: '1px dashed #000'
            }}>
                {/* Header / Logo */}
                <div style={{ width: '100%', marginBottom: '10px' }}>
                    <div className="w-full flex justify-center mb-2">
                        {/* Use simple text or small logo for thermal print */}
                        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>VAPOR FUMÊ</h1>
                    </div>
                </div>

                {/* Info */}
                <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontSize: '0.8rem', margin: '0' }}>Pedido #{order.id}</p>
                    <p style={{ fontSize: '0.8rem', margin: '0' }}>{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                </div>

                {/* Customer Info */}
                <div style={{ marginBottom: '20px', width: '100%', borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '10px 0' }}>
                    <p style={{ fontSize: '1.2rem', margin: '0', fontWeight: 'bold' }}>
                        {order.customerName}
                    </p>
                    {order.customerPhone && <p style={{ fontSize: '0.9rem', margin: '5px 0 0 0' }}>{order.customerPhone}</p>}
                </div>

                {/* Items */}
                <div style={{ width: '100%', textAlign: 'left', marginBottom: '20px' }}>
                    {order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                            <span style={{ flex: 1 }}>
                                {item.quantity}x {item.productName}
                                {item.variantName && <span style={{ display: 'block', fontSize: '0.8rem', color: '#555' }}>- {item.variantName}</span>}
                            </span>
                            <span style={{ fontWeight: 'bold' }}>
                                R$ {(item.price * item.quantity).toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div style={{ width: '100%', borderTop: '1px solid #000', paddingTop: '10px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        <span>TOTAL</span>
                        <span>R$ {order.total.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '5px' }}>
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
                <div style={{ padding: '0', margin: '0 0 20px 0' }}>
                    <QRCode
                        value={qrData}
                        size={100}
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
