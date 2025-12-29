'use server';

import { db } from '@/lib/db';
import { orders } from '@/db/schema';
import { desc, isNotNull } from 'drizzle-orm';

export async function getCustomersForMarketing() {
    // Fetch unique customers who have a phone number
    const allOrders = await db.select({
        name: orders.customerName,
        phone: orders.customerPhone,
        date: orders.createdAt,
        total: orders.total
    })
        .from(orders)
        .where(isNotNull(orders.customerPhone))
        .orderBy(desc(orders.createdAt));

    // Deduplicate by phone
    const uniqueCustomers = [];
    const seenPhones = new Set();

    for (const order of allOrders) {
        if (!order.phone) continue;
        const normalizedPhone = order.phone.replace(/\D/g, '');
        if (normalizedPhone.length < 10) continue; // Basic validation

        if (!seenPhones.has(normalizedPhone)) {
            seenPhones.add(normalizedPhone);
            uniqueCustomers.push({
                name: order.name,
                phone: normalizedPhone,
                lastOrderDate: order.date,
                totalSpent: order.total // This is just last order, ideal would be sum
            });
        }
    }

    return uniqueCustomers;
}

export async function getCustomersForEmail() {
    // Fetch unique customers who have an email
    const allOrders = await db.select({
        name: orders.customerName,
        email: orders.customerEmail,
        date: orders.createdAt,
        total: orders.total
    })
        .from(orders)
        .where(isNotNull(orders.customerEmail))
        .orderBy(desc(orders.createdAt));

    // Deduplicate by email
    const uniqueCustomers = [];
    const seenEmails = new Set();

    for (const order of allOrders) {
        if (!order.email) continue;
        const normalizedEmail = order.email.toLowerCase().trim();

        if (!seenEmails.has(normalizedEmail)) {
            seenEmails.add(normalizedEmail);
            uniqueCustomers.push({
                name: order.name,
                email: normalizedEmail,
                lastOrderDate: order.date,
                totalSpent: order.total
            });
        }
    }

    return uniqueCustomers;
}
