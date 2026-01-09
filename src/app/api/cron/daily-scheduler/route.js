import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messageQueue, restockSubscriptions, orders, products, variants } from '@/db/schema';
import { eq, and, gte, lte, isNull, or, gt, inArray } from 'drizzle-orm';

// Daily Scheduler - Runs at 8:55 AM
// Collects all messages for the day and distributes them in the 9AM-5PM window
// Priority: 1. Restock/Notify-me  2. Winback

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    const CRON_SECRET = process.env.CRON_SECRET || 'vapor_secret_cron_key';
    if (key !== CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();

        // Block Sunday (0 = Sunday in JS)
        if (now.getDay() === 0) {
            return NextResponse.json({
                success: true,
                message: 'Domingo - automações pausadas',
                scheduled: 0
            });
        }

        const pendingMessages = [];

        // === 1. RESTOCK NOTIFICATIONS (Highest Priority) ===
        // Find products that came back in stock (variants with stock > 0)
        // and have pending subscriptions
        const subscriptions = await db.select({
            id: restockSubscriptions.id,
            productId: restockSubscriptions.productId,
            variantName: restockSubscriptions.variantName,
            phone: restockSubscriptions.contactPhone,
            email: restockSubscriptions.contactEmail,
            productName: products.name,
        })
            .from(restockSubscriptions)
            .leftJoin(products, eq(restockSubscriptions.productId, products.id))
            .where(eq(restockSubscriptions.notified, 0));

        for (const sub of subscriptions) {
            if (!sub.phone) continue;

            // Check if variant is now in stock
            const variant = await db.select()
                .from(variants)
                .where(and(
                    eq(variants.productId, sub.productId),
                    eq(variants.name, sub.variantName),
                    gt(variants.stock, 0)
                ))
                .limit(1);

            if (variant.length > 0) {
                pendingMessages.push({
                    phone: sub.phone,
                    content: `🎉 Boa notícia! O produto *${sub.productName}* (${sub.variantName}) que você pediu voltou ao estoque!\n\nCorre lá garantir o seu antes que acabe de novo! 🏃‍♂️\n\nhttps://vaporfume.shop`,
                    type: 'restock_notify',
                    priority: 1,
                    subscriptionId: sub.id
                });
            }
        }

        // === 2. WINBACK MESSAGES (Lower Priority) ===
        const windows = [15, 30, 45];

        for (const daysAgo of windows) {
            const targetDateStart = new Date(now);
            targetDateStart.setDate(now.getDate() - daysAgo);
            targetDateStart.setHours(0, 0, 0, 0);

            const targetDateEnd = new Date(targetDateStart);
            targetDateEnd.setHours(23, 59, 59, 999);

            const eligibleOrders = await db.query.orders.findMany({
                where: (fields, { and, gte, lte, eq }) => and(
                    gte(fields.createdAt, targetDateStart.toISOString()),
                    lte(fields.createdAt, targetDateEnd.toISOString()),
                    eq(fields.status, 'paid') // Only completed orders
                ),
                with: { items: { with: { product: true } } }
            });

            for (const order of eligibleOrders) {
                if (!order.customerPhone) continue;

                // Check if already bought again since then
                const laterOrders = await db.query.orders.findFirst({
                    where: (fields, { and, eq, gt }) => and(
                        eq(fields.customerPhone, order.customerPhone),
                        gt(fields.createdAt, order.createdAt),
                        eq(fields.status, 'paid')
                    )
                });

                if (laterOrders) continue;

                const firstName = order.customerName.split(' ')[0];
                const lastProducts = order.items.map(i => i.productName).slice(0, 2).join(' e ');

                let content = '';
                if (daysAgo === 15) {
                    content = `Olá ${firstName}! 👋\n\nJá fazem 15 dias do seu pedido. O que achou de *${lastProducts}*?\n\nConta pra gente! 😊`;
                } else if (daysAgo === 30) {
                    content = `Oi ${firstName}! 🌬️\n\nO estoque de *${lastProducts}* deve estar acabando hein?\n\nQue tal garantir a reposição? Chegaram novidades no site!`;
                } else if (daysAgo === 45) {
                    content = `Olá ${firstName}! 😢\n\nFaz um tempo que não te vemos por aqui...\n\nSeparamos ofertas especiais pra você! Vem dar uma olhada:\nhttps://vaporfume.shop`;
                }

                pendingMessages.push({
                    phone: order.customerPhone,
                    content,
                    type: `winback_${daysAgo}d`,
                    priority: 2
                });
            }
        }

        // === 3. DISTRIBUTE IN 9AM-5PM WINDOW ===
        const totalMessages = pendingMessages.length;
        if (totalMessages === 0) {
            return NextResponse.json({ success: true, scheduled: 0 });
        }

        // Sort by priority (1 = restock first, 2 = winback after)
        pendingMessages.sort((a, b) => a.priority - b.priority);

        // Calculate time slots (9:00 to 17:00 = 480 minutes)
        const startHour = 9;
        const endHour = 17;
        const windowMinutes = (endHour - startHour) * 60; // 480 minutes
        const intervalMinutes = Math.floor(windowMinutes / totalMessages);

        const messagesToInsert = [];
        const subscriptionsToMark = [];

        for (let i = 0; i < pendingMessages.length; i++) {
            const msg = pendingMessages[i];

            // Calculate scheduled time
            const minutesOffset = i * intervalMinutes;
            const scheduledTime = new Date(now);
            scheduledTime.setHours(startHour, 0, 0, 0);
            scheduledTime.setMinutes(scheduledTime.getMinutes() + minutesOffset);

            // Add some randomness (0-5 min) to avoid looking robotic
            scheduledTime.setMinutes(scheduledTime.getMinutes() + Math.floor(Math.random() * 5));

            messagesToInsert.push({
                phone: msg.phone,
                content: msg.content,
                type: msg.type,
                status: 'pending',
                scheduledAt: Math.floor(scheduledTime.getTime() / 1000)
            });

            if (msg.subscriptionId) {
                subscriptionsToMark.push(msg.subscriptionId);
            }
        }

        // Insert all messages
        if (messagesToInsert.length > 0) {
            await db.insert(messageQueue).values(messagesToInsert);
        }

        // Mark restock subscriptions as notified
        if (subscriptionsToMark.length > 0) {
            await db.update(restockSubscriptions)
                .set({ notified: 1 })
                .where(inArray(restockSubscriptions.id, subscriptionsToMark));
        }

        return NextResponse.json({
            success: true,
            scheduled: messagesToInsert.length,
            breakdown: {
                restock: pendingMessages.filter(m => m.priority === 1).length,
                winback: pendingMessages.filter(m => m.priority === 2).length
            },
            window: `${startHour}:00 - ${endHour}:00`
        });

    } catch (error) {
        console.error('Daily Scheduler Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
