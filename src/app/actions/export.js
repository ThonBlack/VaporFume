'use server';

import { db } from '@/lib/db';
import { orders, orderItems, products } from '@/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';

export async function exportOrdersCSV() {
    // Fetch all orders with items
    const allOrders = await db.query.orders.findMany({
        orderBy: [desc(orders.createdAt)],
        with: {
            items: true
        }
    });

    // Build CSV
    const headers = [
        'ID',
        'Data',
        'Cliente',
        'Telefone',
        'Email',
        'Endereço',
        'Status',
        'Pagamento',
        'Total',
        'Produtos'
    ].join(';');

    const rows = allOrders.map(order => {
        const productsList = order.items
            .map(i => `${i.productName} (${i.variantName || 'S/V'}) x${i.quantity}`)
            .join(' | ');

        // Clean address for CSV
        let addressStr = '';
        if (order.address) {
            try {
                const addr = JSON.parse(order.address);
                addressStr = `${addr.street || ''} ${addr.number || ''} ${addr.neighborhood || ''} ${addr.city || ''}-${addr.state || ''} ${addr.cep || ''}`.trim();
            } catch {
                addressStr = order.address;
            }
        }

        return [
            order.id,
            new Date(order.createdAt).toLocaleDateString('pt-BR'),
            order.customerName?.replace(/;/g, ',') || '',
            order.customerPhone || '',
            order.customerEmail || '',
            addressStr.replace(/;/g, ','),
            order.status,
            order.paymentMethod || '',
            order.total.toFixed(2).replace('.', ','),
            productsList.replace(/;/g, ',')
        ].join(';');
    });

    const csv = [headers, ...rows].join('\n');

    return {
        success: true,
        csv,
        filename: `pedidos_${new Date().toISOString().split('T')[0]}.csv`
    };
}
