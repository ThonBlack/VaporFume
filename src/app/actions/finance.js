'use server';

import { db } from '@/lib/db';
import { orders, orderItems, products } from '@/db/schema';
import { sql, and, gte, lte, eq, inArray } from 'drizzle-orm';

/**
 * Get Financial Metrics for a given period
 * @param {string|Date} startDate 
 * @param {string|Date} endDate 
 */
export async function getFinancialMetrics(startDate, endDate) {
    // Ensure dates are ISO strings for comparison
    const start = new Date(startDate).toISOString();
    const end = new Date(endDate).toISOString();

    // 1. Raw Sales Data
    const sales = await db.select({
        id: orders.id,
        total: orders.total,
        id: orders.id,
        total: orders.total,
        date: orders.createdAt,
        paymentMethod: orders.paymentMethod
    })
        .from(orders)
        .where(and(
            gte(orders.createdAt, start),
            lte(orders.createdAt, end),
            inArray(orders.status, ['Pago', 'paid', 'completed'])
        ));

    // 2. Calculate Revenue & Ticket & Count
    const revenue = sales.reduce((acc, order) => acc + order.total, 0);
    const count = sales.length;
    const avgTicket = count > 0 ? revenue / count : 0;

    // 3. Calculate Profit (Need to join with items AND products for fallback cost)
    const items = await db.select({
        price: orderItems.price,
        cost: orderItems.costPrice,
        quantity: orderItems.quantity,
        productName: orderItems.productName,
        variantName: orderItems.variantName,
        currentProductCost: products.costPrice
    })
        .from(orderItems)
        .leftJoin(orders, eq(orderItems.orderId, orders.id))
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(and(
            gte(orders.createdAt, start),
            lte(orders.createdAt, end),
            inArray(orders.status, ['Pago', 'paid', 'completed'])
        ));

    let totalCost = 0;
    items.forEach(item => {
        // Fallback Logic: Use historical cost if > 0, otherwise use current product cost
        const historicalCost = parseFloat(item.cost || 0);
        const currentCost = parseFloat(item.currentProductCost || 0);
        const finalCost = historicalCost > 0 ? historicalCost : currentCost;

        totalCost += finalCost * item.quantity;
    });

    const profit = revenue - totalCost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    // 4. Daily aggregations for Chart
    const dailyData = {};
    sales.forEach(order => {
        const day = order.date.split('T')[0]; // YYYY-MM-DD
        if (!dailyData[day]) dailyData[day] = { date: day, revenue: 0, orders: 0 };
        dailyData[day].revenue += order.total;
        dailyData[day].orders += 1;
    });

    // 5. Product Performance
    const productStats = {};
    items.forEach(item => {
        let key = item.productName || 'Produto Desconhecido';
        if (item.variantName) key += ` (${item.variantName})`;

        if (!productStats[key]) {
            productStats[key] = { name: key, revenue: 0, quantity: 0, profit: 0 };
        }

        const historicalCost = parseFloat(item.cost || 0);
        const currentCost = parseFloat(item.currentProductCost || 0);
        const finalCost = historicalCost > 0 ? historicalCost : currentCost;

        productStats[key].revenue += (item.price * item.quantity);
        productStats[key].quantity += item.quantity;
        productStats[key].profit += ((item.price - finalCost) * item.quantity);
    });

    const topProducts = Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5); // Top 5

    // Fill missing days if needed, but for now return dense data
    const chartData = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

    // 6. Payment Method Breakdown (New)
    const paymentMethods = {
        pix: { count: 0, revenue: 0 },
        credit_card: { count: 0, revenue: 0 },
        cash: { count: 0, revenue: 0 },
        unknown: { count: 0, revenue: 0 }
    };

    sales.forEach(order => {
        const method = order.paymentMethod;
        if (paymentMethods[method]) {
            paymentMethods[method].count++;
            paymentMethods[method].revenue += order.total;
        } else {
            // Handle null or legacy data
            const key = method ? 'unknown' : 'pix'; // Assume legacy as pix or unknown? Let's default legacy to 'pix' if mostly pix, or keep unknown.
            // Actually, safe bet is unknown for accuracy.
            paymentMethods['unknown'].count++;
            paymentMethods['unknown'].revenue += order.total;
        }
    });

    return {
        revenue,
        profit,
        margin,
        count,
        avgTicket,
        chartData,
        topProducts,
        paymentMethods
    };
}
