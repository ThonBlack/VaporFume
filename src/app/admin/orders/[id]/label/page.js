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
                width: '300px',
                height: '450px',
                border: '4px solid #333',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'center',
                fontFamily: 'sans-serif'
            }}>
                {/* Header / Logo */}
                <div style={{ width: '100%' }}>
                    <div className="w-full flex justify-center mb-4">
                        <img src="/assets/logo-custom.png" alt="Vapor Fume" style={{ maxHeight: '60px', objectFit: 'contain' }} />
                    </div>
                    <div style={{ width: '100%', height: '1px', background: '#ccc', margin: '0 auto 16px auto' }}></div>
                </div>

                {/* Customer Info */}
                <div>
                    <h2 style={{ fontSize: '1.2rem', margin: '0 0 8px 0', fontWeight: 'bold' }}>Encomenda de:</h2>
                    <p style={{ fontSize: '1.5rem', margin: '0', fontWeight: 'bold' }}>
                        {order.customerName.split(' ')[0]} {/* First Name usually bigger */}
                    </p>
                    <p style={{ fontSize: '1rem', color: '#666' }}>{order.customerName}</p>
                </div>

                {/* QR Code */}
                <div style={{ padding: '16px', background: '#fff' }}>
                    <QRCode
                        value={qrData}
                        size={128}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                </div>

                {/* Footer */}
                <div style={{ width: '100%' }}>
                    <div style={{ width: '100%', height: '1px', background: '#ccc', margin: '16px auto' }}></div>
                    <p style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>Agradecemos pela preferência</p>
                </div>
            </div>
        </div>
    );
}
