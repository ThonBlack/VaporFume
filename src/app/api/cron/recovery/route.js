import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, messageQueue } from '@/db/schema';
import { and, eq, lte, gte, isNull, or } from 'drizzle-orm';

// CRON SECRET KEY: Protect this endpoint
// Call like: https://vaporfume.shop/api/cron/recovery?key=YOUR_SECRET_KEY

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // Simple auth
    const CRON_SECRET = process.env.CRON_SECRET || 'recovery123';
    if (key !== CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();
        const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

        // 1. Find Candidates
        // Pending orders, created > 30mins ago, < 24h ago, NOT sent yet
        const candidates = await db.select()
            .from(orders)
            .where(and(
                eq(orders.status, 'pending'),
                lte(orders.createdAt, thirtyMinsAgo),
                gte(orders.createdAt, twentyFourHoursAgo),
                or(isNull(orders.recoveryStatus), eq(orders.recoveryStatus, 'none'))
            ));

        const processed = [];

        // 2. Process Each Candidate
        for (const order of candidates) {
            if (!order.customerPhone) continue;

            const customerName = order.customerName.split(' ')[0]; // First name
            const message = `Olá ${customerName}! 👋\n\nNotamos que seu pedido no *Vapor Fumê* (R$ ${order.total.toFixed(2)}) ficou pendente.\n\nPrecisa de ajuda para concluir? Os itens já estão reservados pra você!\n\nSe tiver alguma dúvida, é só responder aqui. 😉`;

            // Queue Message
            await db.insert(messageQueue).values({
                phone: order.customerPhone,
                content: message,
                type: 'recovery',
                status: 'pending',
                scheduledAt: Math.floor(Date.now() / 1000) // Send immediately (or soon)
            });

            // Mark as Sent
            await db.update(orders)
                .set({
                    recoveryStatus: 'sent',
                    recoverySentAt: new Date().toISOString()
                })
                .where(eq(orders.id, order.id));

            processed.push(order.id);
        }

        return NextResponse.json({
            success: true,
            processedCount: processed.length,
            ids: processed
        });

    } catch (error) {
        console.error('Cron Job Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
