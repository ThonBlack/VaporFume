'use server';

import { createOrder as createDbOrder } from '@/app/actions/orders'; // Reuse existing
import { getSettings } from '@/app/actions/settings';
import { generateWhatsAppLink, generateOrderMessage } from '@/lib/whatsapp';
import { createPixPayment } from '@/lib/mercadopago';

console.log('[Checkout] Starting processCheckout with data:', JSON.stringify(data, null, 2));

try {
    // 1. Create Order in Database
    console.log('[Checkout] Creating DB Order...');
    const orderId = await createDbOrder({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        total: data.total,
        items: data.items,
        customerPhone: data.customerPhone
    });
    console.log('[Checkout] Order Created! ID:', orderId);

    // Re-fetch full order
    const order = { ...data, id: orderId, paymentMethod: data.paymentMethod };

    console.log('[Checkout] Fetching Settings...');
    const settings = await getSettings();
    console.log('[Checkout] Settings fetched:', settings);

    const whatsappNumber = settings?.whatsapp_number;

    let result = {
        orderId,
        redirectUrl: null,
        pixData: null,
    };

    // 2. Handle Payment Method
    if (data.paymentMethod === 'whatsapp') {
        console.log('[Checkout] Payment Method: WhatsApp');
        if (whatsappNumber) {
            const message = generateOrderMessage(order);
            result.redirectUrl = generateWhatsAppLink(whatsappNumber, message);
            console.log('[Checkout] WhatsApp Link Generated');
        } else {
            console.warn('[Checkout] No WhatsApp number found in settings.');
        }
    } else if (data.paymentMethod === 'mercadopago') {
        console.log('[Checkout] Payment Method: Mercado Pago');
        try {
            const pix = await createPixPayment(order);
            result.pixData = pix;
        } catch (error) {
            console.error('[Checkout] Payment Error:', error);
            return { error: 'Erro ao gerar Pix. Verifique as configurações.' };
        }
    }

    return result;

} catch (error) {
    console.error('[Checkout] CRITICAL ERROR:', error);
    return { error: 'Erro interno no servidor: ' + error.message };
}
}
