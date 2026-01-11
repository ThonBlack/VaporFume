'use server';

import { db } from '@/lib/db';
import { orders, settings } from '@/db/schema';
import { eq } from 'drizzle-orm';

const ZAP_ENTREGAS_URL = 'https://zapentregas.duckdns.org/api/integration/delivery';

export async function sendToZapEntregas(orderId) {
    try {
        // 1. Get API Key from settings
        const apiKeySetting = await db.select()
            .from(settings)
            .where(eq(settings.key, 'zap_entregas_api_key'))
            .limit(1);

        const apiKey = apiKeySetting[0]?.value;
        if (!apiKey) {
            return { success: false, error: 'API Key do Zap Entregas não configurada. Vá em Configurações.' };
        }

        // 2. Get order data
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
            with: { items: true }
        });

        if (!order) {
            return { success: false, error: 'Pedido não encontrado.' };
        }

        // 3. Parse address
        let addressStr = '';
        if (order.address) {
            try {
                const addr = JSON.parse(order.address);
                addressStr = `${addr.street || ''}, ${addr.number || ''} - ${addr.neighborhood || ''} - ${addr.city || ''}/${addr.state || ''} - CEP ${addr.cep || ''}`;
                if (addr.complement) addressStr += ` (${addr.complement})`;
            } catch {
                addressStr = order.address;
            }
        }

        if (!addressStr) {
            return { success: false, error: 'Pedido sem endereço de entrega.' };
        }

        // 4. Build observation with items
        const itemsList = order.items
            .map(i => `${i.quantity}x ${i.productName}${i.variantName ? ` (${i.variantName})` : ''}`)
            .join(', ');
        const observation = `Pedido #${order.id} - ${itemsList}`;

        // 5. Call Zap Entregas API
        const response = await fetch(ZAP_ENTREGAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey
            },
            body: JSON.stringify({
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                address: addressStr,
                value: order.total,
                fee: 0, // Taxa de entrega - ajustar conforme necessário
                observation
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            return { success: false, error: result.message || result.error || 'Erro ao criar entrega' };
        }

        // 6. Save delivery info to order (optional - could add fields to schema)
        // For now, just return success
        return {
            success: true,
            deliveryId: result.deliveryId,
            trackingUrl: result.trackingUrl,
            message: 'Entrega enviada para o Zap Entregas!'
        };

    } catch (error) {
        console.error('Zap Entregas Error:', error);
        return { success: false, error: 'Erro de conexão com Zap Entregas.' };
    }
}

export async function getDeliveryStatus(deliveryId) {
    try {
        const apiKeySetting = await db.select()
            .from(settings)
            .where(eq(settings.key, 'zap_entregas_api_key'))
            .limit(1);

        const apiKey = apiKeySetting[0]?.value;
        if (!apiKey) {
            return { success: false, error: 'API Key não configurada.' };
        }

        const response = await fetch(`${ZAP_ENTREGAS_URL}?id=${deliveryId}`, {
            method: 'GET',
            headers: { 'X-API-KEY': apiKey }
        });

        const result = await response.json();
        return result;

    } catch (error) {
        console.error('Zap Entregas Status Error:', error);
        return { success: false, error: 'Erro ao consultar status.' };
    }
}
