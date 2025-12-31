import { getOrderById } from '@/app/actions/orders';
import QRCode from 'react-qr-code';
import { notFound } from 'next/navigation';

export default async function PrintOrderPage({ params }) {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) { notFound(); }

    const order = await getOrderById(orderId);

    if (!order) return <div>Pedido não encontrado</div>;

    // URL for Customer Tracking
    // Using VPS IP until domain is ready
    const trackUrl = `http://72.61.135.4:3000/track/${orderId}`;

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
                fontFamily: 'monospace',
                boxSizing: 'border-box',
            }}>
                {/* Header / Logo */}
                <div style={{ width: '100%', marginBottom: '15px' }}>
                    <div className="w-full flex justify-center mb-2">
                        {/* Minimalist Header Text or Logo - User asked for "Vapor Fumê" */}
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, letterSpacing: '2px' }}>VAPOR FUMÊ</h1>
                    </div>
                </div>

                {/* Sub: Customer Name */}
                <div style={{ marginBottom: '20px', width: '100%', borderBottom: '1px solid #000', paddingBottom: '10px' }}>
                    <p style={{ fontSize: '0.9rem', margin: '0 0 5px 0' }}>Encomenda de:</p>
                    <p style={{ fontSize: '1.4rem', margin: '0', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {order.customerName.split(' ')[0]} {/* First Name usually looks cleaner, or full if short */}
                    </p>
                </div>

                {/* QR Code */}
                <div style={{ padding: '0', margin: '0 0 20px 0' }}>
                    <QRCode
                        value={trackUrl}
                        size={160}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                </div>

                {/* Footer */}
                <div style={{ width: '100%' }}>
                    <p style={{ fontSize: '0.9rem', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>Agradecemos a preferência</p>
                </div>
            </div>
            <script dangerouslySetInnerHTML={{ __html: 'window.print();' }} />
        </div>
    );
}
