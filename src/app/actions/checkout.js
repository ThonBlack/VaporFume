'use server';

import { createOrder as createDbOrder } from '@/app/actions/orders';
import { getSettings } from '@/app/actions/settings';
import { generateWhatsAppLink, generateOrderMessage } from '@/lib/whatsapp';
import { createPixPayment } from '@/lib/mercadopago';

export async function processCheckout(data) {
    console.log('[Checkout Debug] Mock Action called with:', data);

    // Simulate slight delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        orderId: 9999,
        redirectUrl: `https://wa.me/?text=Teste%20Mock%20Sucesso`,
        pixData: null
    };
}
