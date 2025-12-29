'use server';

import { createOrder as createDbOrder } from '@/app/actions/orders'; // Reuse existing
import { getSettings } from '@/app/actions/settings';
import { generateWhatsAppLink, generateOrderMessage } from '@/lib/whatsapp';
import { createPixPayment } from '@/lib/mercadopago';

export async function processCheckout(data) {
    // 1. Create Order in Database
    const orderId = await createDbOrder({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        total: data.total,
        items: data.items,
        // Add extra metadata columns if needed later, for now relying on basic schema
    });

    // Re-fetch full order to generate message correctly
    // (In a real app, optimize this to avoid re-fetch)
    const order = { ...data, id: orderId, paymentMethod: data.paymentMethod };

    const settings = await getSettings();
    const whatsappNumber = settings.whatsapp_number;

    let result = {
        orderId,
        redirectUrl: null,
        pixData: null,
    };

    // 2. Handle Payment Method
    if (data.paymentMethod === 'whatsapp') {
        // A Combinar: Redirect to WhatsApp
        if (whatsappNumber) {
            const message = generateOrderMessage(order);
            result.redirectUrl = generateWhatsAppLink(whatsappNumber, message);
        }
    } else if (data.paymentMethod === 'mercadopago') {
        // Mercado Pago Pix
        try {
            const pix = await createPixPayment(order);
            result.pixData = pix;
        } catch (error) {
            console.error('Payment Error:', error);
            // Fallback to whatsapp if payment fails? Or just return error
            return { error: 'Erro ao gerar Pix. Verifique as configurações.' };
        }
    }

    return result;
}
