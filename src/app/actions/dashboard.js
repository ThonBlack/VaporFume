'use server';

import { db } from '@/lib/db';
import { orders, orderItems, products, variants } from '@/db/schema';
import { sql, desc, eq, inArray } from 'drizzle-orm';

export async function getDashboardStats() {
    // 1. Total Revenue (Paid orders)
    // For simplicity, we assume paid if status is 'paid' or 'completed' or mock 'Pago'
    // Adjust logic based on your exact status strings.
    const paidOrders = await db.select().from(orders).where(inArray(orders.status, ['Pago', 'paid', 'completed']));

    // Revenue
    const totalRevenue = paidOrders.reduce((acc, order) => acc + order.total, 0);

    // 2. Pending Orders
    const pendingOrdersResult = await db.select({ count: sql`count(*)` }).from(orders).where(eq(orders.status, 'pending'));
    const pendingCount = pendingOrdersResult[0].count;

    // 3. Active Products & Low Stock Logic
    const allProducts = await db.select().from(products);
    const productCount = allProducts.length;

    // 4. Profit Calculation (Revenue - Cost of Goods Sold)
    const paidOrderIds = paidOrders.map(o => o.id);
    let totalCost = 0;

    if (paidOrderIds.length > 0) {
        // Fetch items from paid orders
        // Use historical costPrice if available (preferred), else fallback to current product costPrice
        const items = await db.select({
            quantity: orderItems.quantity,
            historicalCost: orderItems.costPrice,
            currentCost: products.costPrice
        })
            .from(orderItems)
            .leftJoin(products, eq(orderItems.productId, products.id))
            .where(inArray(orderItems.orderId, paidOrderIds));

        totalCost = items.reduce((acc, item) => {
            // Prefer historical cost, fallback to current cost, default to 0
            const cost = (item.historicalCost !== null && item.historicalCost !== undefined)
                ? item.historicalCost
                : (item.currentCost || 0);

            return acc + (item.quantity * cost);
        }, 0);
    }

    const netProfit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    // 5. Recent Orders (Last 5)
    const recentOrders = await db.query.orders.findMany({
        limit: 5,
        orderBy: [desc(orders.createdAt)],
    });

    return {
        revenue: totalRevenue,
        pending: pendingCount,
        products: productCount,
        profit: netProfit,
        margin: margin,
        recent: recentOrders
    };
}
