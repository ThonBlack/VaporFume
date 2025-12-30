'use server';

import { createOrder as createDbOrder } from '@/app/actions/orders';
import { getSettings } from '@/app/actions/settings';
import { generateWhatsAppLink, generateOrderMessage } from '@/lib/whatsapp';
import { createPixPayment } from '@/lib/mercadopago';

export async function processCheckout(data) {
    try {
        console.log('[Checkout Action] Processing started', data);

        // 1. Get Settings (for Pix/WhatsApp numbers)
        const settings = await getSettings();

        // 2. Create Order in DB (Status: pending)
        const orderId = await createDbOrder({
            customerName: data.customerName,
            customerEmail: data.customerEmail || 'nao_informado@email.com',
            customerPhone: data.customerPhone || '',
            items: data.items,
            total: data.total,
            paymentMethod: data.paymentMethod
        });

        console.log('[Checkout Action] Order created:', orderId);

        // 3. Handle Payment Method
        if (data.paymentMethod === 'mercadopago') {
            console.log('[Checkout Action] Creating Pix...');
            try {
                const pix = await createPixPayment({
                    amount: data.total,
                    email: data.customerEmail || 'client@vaporfume.com',
                    description: `Pedido #${orderId} - Vapor Fumê`,
                    payer: {
                        first_name: data.customerName.split(' ')[0],
                        last_name: data.customerName.split(' ').slice(1).join(' ') || 'Cliente'
                    }
                });
                return { orderId, pixData: pix };
            } catch (pixError) {
                console.error('[Checkout Action] Pix Error:', pixError);
                throw new Error('Falha ao gerar Pix. Tente WhatsApp.');
            }
        }

        // WhatsApp or Card (Manual)
        const message = generateOrderMessage({ ...data, id: orderId });
        const link = generateWhatsAppLink(settings?.whatsapp_number || '5567999999999', message);

        return { orderId, redirectUrl: link };

    } catch (error) {
        console.error('[Checkout Action] CRITICAL ERROR:', error);
        return { error: error.message || 'Erro interno no servidor' };
    }
}
