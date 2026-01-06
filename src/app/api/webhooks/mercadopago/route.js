import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// If you have a webhook secret from MP, verify it. 
// For now, we trust the ID lookup from MP API or basic payload for MVP.

export async function POST(req) {
    try {
        // 1. Validate Secret (Optional for MVP, skipping for now)
        // const secret = req.headers.get('x-signature-...');

        const body = await req.json();
        const { type, data, action } = body;

        console.log('[Webhook] Notification:', type, action, data?.id);

        // Handle 'payment.updated' or 'payment.created' (action) OR type='payment'
        if (type === 'payment' || action === 'payment.created' || action === 'payment.updated') {
            const paymentId = data?.id;

            if (paymentId) {
                console.log('[Webhook] Fetching Payment:', paymentId);

                // Dynamic import to avoid circular dep issues in some contexts, but static is fine here if verified
                const { getPayment } = await import('@/lib/mercadopago');
                const payment = await getPayment(paymentId);

                console.log('[Webhook] Payment Status:', payment.status);
                console.log('[Webhook] External Reference (Order ID):', payment.external_reference);

                if (payment.status === 'approved' && payment.external_reference) {
                    const orderId = parseInt(payment.external_reference);

                    if (!isNaN(orderId)) {
                        await db.update(orders)
                            .set({ status: 'paid' }) // Update to 'Paid' (Blue/Teal)
                            .where(eq(orders.id, orderId));

                        console.log('[Webhook] Order updated to PAID:', orderId);
                    }
                }
            }
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error('[Webhook Error]', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
