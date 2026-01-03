'use server';

import { db } from '@/lib/db';
import { orders, orderItems } from '@/db/schema';
import { sql, and, gte, lte, eq } from 'drizzle-orm';

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
        date: orders.createdAt
    })
        .from(orders)
        .where(and(
            gte(orders.createdAt, start),
            lte(orders.createdAt, end),
            // Filter out cancelled if you implement that status
            // ne(orders.status, 'cancelled') 
        ));

    // 2. Calculate Revenue & Ticket
    const revenue = sales.reduce((acc, order) => acc + order.total, 0);
    const count = sales.length;
    const avgTicket = count > 0 ? revenue / count : 0;

    // 3. Calculate Profit (Need to join with items)
    // We fetch all items from these orders
    price: orderItems.price,
        cost: orderItems.costPrice,
            quantity: orderItems.quantity,
                productName: orderItems.productName,
                    variantName: orderItems.variantName,
                        date: orders.createdAt
})
        .from(orderItems)
    .leftJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(
        gte(orders.createdAt, start),
        lte(orders.createdAt, end)
    ));

let totalCost = 0;
items.forEach(item => {
    totalCost += (item.cost || 0) * item.quantity;
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
    const key = item.productName || 'Desconhecido';
    if (!productStats[key]) {
        productStats[key] = { name: key, revenue: 0, quantity: 0, profit: 0 };
    }
    productStats[key].revenue += (item.price * item.quantity);
    productStats[key].quantity += item.quantity;
    productStats[key].profit += ((item.price - (item.cost || 0)) * item.quantity);
});

const topProducts = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5); // Top 5

// Fill missing days if needed, but for now return dense data
const chartData = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

return {
    revenue,
    profit,
    margin,
    count,
    avgTicket,
    chartData,
    topProducts
};
}
