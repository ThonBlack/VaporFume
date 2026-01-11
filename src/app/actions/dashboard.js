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
            // Prefer historical cost IF > 0, otherwise fallback to current cost
            const cost = (item.historicalCost && item.historicalCost > 0)
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

    // 6. Sales by Day (Last 7 days) for Chart
    const salesByDay = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0)).toISOString();
        const dayEnd = new Date(date.setHours(23, 59, 59, 999)).toISOString();

        const dayOrders = paidOrders.filter(o =>
            o.createdAt >= dayStart && o.createdAt <= dayEnd
        );

        salesByDay.push({
            date: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }),
            total: dayOrders.reduce((acc, o) => acc + o.total, 0),
            count: dayOrders.length
        });
    }

    // 7. Low Stock Alert (variants with stock <= 5)
    const allVariants = await db.select({
        name: variants.name,
        stock: variants.stock,
        productName: products.name
    })
        .from(variants)
        .leftJoin(products, eq(variants.productId, products.id));

    const lowStockItems = allVariants.filter(v => v.stock > 0 && v.stock <= 5);

    // 8. Average Ticket (Ticket Médio)
    const avgTicket = paidOrders.length > 0
        ? totalRevenue / paidOrders.length
        : 0;

    // 9. Top 5 Products (Mais Vendidos)
    const topProductsMap = {};
    if (paidOrderIds.length > 0) {
        const allItems = await db.select({
            productName: orderItems.productName,
            quantity: orderItems.quantity,
            total: sql`${orderItems.price} * ${orderItems.quantity}`
        })
            .from(orderItems)
            .where(inArray(orderItems.orderId, paidOrderIds));

        for (const item of allItems) {
            const name = item.productName || 'Produto sem nome';
            if (!topProductsMap[name]) {
                topProductsMap[name] = { name, quantity: 0, total: 0 };
            }
            topProductsMap[name].quantity += item.quantity;
            topProductsMap[name].total += item.total || 0;
        }
    }
    const topProducts = Object.values(topProductsMap)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    // 10. Top 5 Customers (Clientes por Valor)
    const topCustomersMap = {};
    for (const order of paidOrders) {
        const phone = order.customerPhone || order.customerName || 'Anônimo';
        if (!topCustomersMap[phone]) {
            topCustomersMap[phone] = {
                name: order.customerName || 'Anônimo',
                phone: order.customerPhone,
                orders: 0,
                total: 0
            };
        }
        topCustomersMap[phone].orders += 1;
        topCustomersMap[phone].total += order.total;
    }
    const topCustomers = Object.values(topCustomersMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    return {
        revenue: totalRevenue,
        pending: pendingCount,
        products: productCount,
        profit: netProfit,
        margin: margin,
        recent: recentOrders,
        salesByDay,
        lowStock: lowStockItems,
        avgTicket,
        topProducts,
        topCustomers,
        totalOrders: paidOrders.length
    };
}
