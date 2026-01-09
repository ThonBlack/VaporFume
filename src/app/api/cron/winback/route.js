
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, messageQueue, products, favorites } from '@/db/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key !== process.env.CRON_SECRET && key !== 'vapor_secret_cron_key') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Block Sunday
    if (new Date().getDay() === 0) {
        return NextResponse.json({ success: true, message: 'Domingo - pausado', count: 0 });
    }

    try {
        const now = new Date();
        const pendingMessages = [];

        // Define windows (Days ago)
        const windows = [15, 30, 45];

        for (const daysAgo of windows) {
            // Calculate target date range (start of that day to end of that day)
            // Actually, for simplicity, we check orders created BEFORE (daysAgo) and AFTER (daysAgo + 1)
            // But strict day matching is better.

            const targetDateStart = new Date(now);
            targetDateStart.setDate(now.getDate() - daysAgo);
            targetDateStart.setHours(0, 0, 0, 0);

            const targetDateEnd = new Date(targetDateStart);
            targetDateEnd.setHours(23, 59, 59, 999);

            // 1. Find orders in this window
            const eligibleOrders = await db.query.orders.findMany({
                where: (fields, { and, gte, lte }) => and(
                    gte(fields.createdAt, targetDateStart.toISOString()),
                    lte(fields.createdAt, targetDateEnd.toISOString())
                ),
                with: {
                    items: { with: { product: true } }
                }
            });

            for (const order of eligibleOrders) {
                if (!order.customerPhone) continue;

                // 2. Check if customer has bought SINCE this order
                const laterOrders = await db.query.orders.findFirst({
                    where: (fields, { and, eq, gt }) => and(
                        eq(fields.customerPhone, order.customerPhone),
                        gt(fields.createdAt, order.createdAt)
                    )
                });

                if (laterOrders) continue; // Already bought again, skip winback

                // 3. Prepare Variables
                const firstName = order.customerName.split(' ')[0];
                const lastProducts = order.items.map(i => i.productName).slice(0, 3).join(', ');

                // Get Favorites
                const userFavorites = await db.select({ name: products.name })
                    .from(favorites)
                    .leftJoin(products, eq(favorites.productId, products.id))
                    .where(eq(favorites.userPhone, order.customerPhone));
                const lastFavorites = userFavorites.map(f => f.name).join(', ') || 'novidades';

                // 4. Construct Message
                let content = '';
                if (daysAgo === 15) {
                    content = `Olá ${firstName}! 👋 Já fazem 15 dias do seu último pedido. O que achou de *${lastProducts}*? Conta pra gente!`;
                } else if (daysAgo === 30) {
                    content = `Oi ${firstName}! O estoque de *${lastProducts}* deve estar acabando hein? 🌬️ Que tal garantir a reposição? Chegaram novidades!`;
                } else if (daysAgo === 45) {
                    content = `Olá ${firstName}, tudo bem? 😢 Faz um tempo que não te vemos. Separamos umas ofertas especiais baseadas no que você curte (*${lastFavorites}*). Vem dar uma olhada no site!`;
                }

                // 5. Schedule (Distributed 9-17)
                // Random time between 9am and 5pm tomorrow (since cron runs at night usually? or allow today if early)
                // Let's assume cron runs at 8am.
                // We pick a random slot between 9am and 5pm TODAY.

                const startHour = 9;
                const endHour = 17;
                const randomHour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
                const randomMinute = Math.floor(Math.random() * 60);

                const scheduledTime = new Date(now);
                scheduledTime.setHours(randomHour, randomMinute, 0, 0);

                // If currently it's already past that time, schedule for tomorrow?
                // Or just push to next valid slot. 
                // Simple logic: If scheduledTime < now, add 24h? 
                // But if cron runs at 00:00, it's fine.

                pendingMessages.push({
                    phone: order.customerPhone,
                    content,
                    type: `winback_${daysAgo}d`,
                    status: 'pending',
                    scheduledAt: Math.floor(scheduledTime.getTime() / 1000)
                });
            }
        }

        if (pendingMessages.length > 0) {
            await db.insert(messageQueue).values(pendingMessages);
        }

        return NextResponse.json({ success: true, count: pendingMessages.length });

    } catch (error) {
        console.error('Winback Cron Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
