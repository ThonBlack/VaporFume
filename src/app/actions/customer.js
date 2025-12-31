'use server';

import { db } from '@/lib/db';
import { orders } from '@/db/schema';
import { like, desc } from 'drizzle-orm';

export async function getMyOrders(phoneRaw) {
    if (!phoneRaw) return { success: false, message: 'Digite seu telefone' };

    // Normalize: Keep only numbers
    const cleanPhone = phoneRaw.replace(/\D/g, '');

    if (cleanPhone.length < 8) return { success: false, message: 'Telefone inválido' };

    try {
        // Search strictly by phone containing the numbers (getting last 8 or 9 digits usually safer, but let's try strict contains)
        // VaporFume usually saves as "5534...", so if user types "349...", a like query works.
        const results = await db.query.orders.findMany({
            where: like(orders.customerPhone, `%${cleanPhone}%`),
            orderBy: [desc(orders.createdAt)],
            limit: 10,
            with: {
                items: true
            }
        });

        return { success: true, orders: results };
    } catch (error) {
        console.error('Error fetching my orders:', error);
        return { success: false, message: 'Erro ao buscar pedidos.' };
    }
}
