import { getOrderById } from '@/app/actions/orders';
import QRCode from 'react-qr-code';
import { notFound } from 'next/navigation';

export default async function OrderLabelPage({ params }) {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) { notFound(); }

    const order = await getOrderById(orderId);

    if (!order) return <div>Pedido não encontrado</div>;

    // Create a concise summary for the QR Code
    const qrData = `Pedido #${order.id}\nCli: ${order.customerName}\nTotal: R$ ${order.total.toFixed(2)}\n${order.items.map(i => `${i.quantity}x ${i.productName}`).join('\n')}`;

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff'
        }}>
            <style>{`
                @media print {
                    @page { size: auto; margin: 0mm; }
                    body { margin: 0px; }
                }
            `}</style>

            <div style={{
                width: '320px',
                height: '480px',
                border: '6px solid #444', // Thicker border
                borderRadius: '12px',      // Rounded corners like reference
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'center',
                fontFamily: 'sans-serif',
                boxSizing: 'border-box'
            }}>
                {/* Header / Logo */}
                <div style={{ width: '100%' }}>
                    <div className="w-full flex justify-center mb-6">
                        {/* Using text if logo not available or prefer cleaner look, but user asked for logo in ref? Ref image has text logo. */}
                        <img src="/assets/logo-custom.png" alt="Vapor Fume" style={{ maxHeight: '50px', objectFit: 'contain' }} />
                    </div>
                    {/* <div style={{ width: '100%', height: '1px', background: '#ccc', margin: '0 auto 16px auto' }}></div> */}
                </div>

                {/* Customer Info */}
                <div>
                    <h2 style={{ fontSize: '1.2rem', margin: '0 0 8px 0', fontWeight: 'bold', color: '#000' }}>Encomenda de:</h2>
                    <p style={{ fontSize: '1.8rem', margin: '0', fontWeight: '900', color: '#000', textTransform: 'uppercase' }}>
                        {order.customerName.split(' ')[0]}
                    </p>
                </div>

                {/* QR Code */}
                <div style={{ padding: '0', margin: '20px 0' }}>
                    <QRCode
                        value={qrData}
                        size={140}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                </div>

                {/* Footer */}
                <div style={{ width: '100%' }}>
                    <div style={{ width: '100%', height: '2px', background: '#000', margin: '0 auto 16px auto' }}></div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: '#000' }}>Agradecemos pela preferência</p>
                </div>
            </div>
        </div>
    );
}
