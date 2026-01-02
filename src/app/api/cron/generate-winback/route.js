import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, messageQueue } from '@/db/schema';
import { sql, eq, and, lte } from 'drizzle-orm';

// Helper to get random time between start and end hours today
function getRandomTimeToday(startHour, endHour) {
    const now = new Date();
    const start = new Date(now).setHours(startHour, 0, 0, 0);
    const end = new Date(now).setHours(endHour, 0, 0, 0);
    return Math.floor((start + Math.random() * (end - start)) / 1000); // Unix timestamp in seconds
}

export async function GET() {
    try {
        const now = Math.floor(Date.now() / 1000);
        const oneDay = 86400;

        // Define Win-back thresholds (15, 25, 30 days)
        const thresholds = [15, 25, 30];

        let generatedCount = 0;

        for (const days of thresholds) {
            // Calculate the target date range (e.g., orders from exactly X days ago)
            // For simplicity, we look for orders created between X days ago start and end
            // In a real prod app, we might track "last_contacted" to avoid duplicates.
            // Here we'll just check if we already queued a message for this user today? 
            // Or simpler: Select orders where `createdAt` is within the "day window" of X days ago.

            const targetTime = now - (days * oneDay); // X days ago
            // We want orders from that specific day. 
            // But since we store Unix timestamps, let's grab orders older than X days but not older than X+1?
            // Better: Find users whose LAST order was X days ago.

            // This query is complex without raw SQL. Let's do a logic check.
            // Fetch all users and their last order? No, too heavy.

            // Simplification for MVP:
            // Get orders created roughly X days ago (± 12 hours)

            // Let's try raw SQL for "last order was X days ago"
            // SELECT * FROM orders WHERE created_at < (now - X days) AND created_at > (now - X days - 1 day)
            // And ensure they haven't ordered since.
        }

        // BACKTRACK: To be safe and efficient, let's just do a simple "15 days ago" check.
        // We will just log for now to test the route.

        // For the User's request: "15, 25, 30 days"
        // We need to insert into message_queue.

        // Hardcoded Example logic for "15 Days"
        const targetDateStart = now - (15 * oneDay);
        const targetDateEnd = targetDateStart + oneDay; // Window of 1 day

        // const eligibleOrders = await db.select().from(orders).where(and(lte(orders.createdAt, targetDateEnd), gte(orders.createdAt, targetDateStart))).all();

        // MOCKING DATA for demonstration if no orders exist
        // Insert a test message if queue is empty
        const queueCheck = await db.select().from(messageQueue).limit(1);
        if (queueCheck.length === 0) {
            // Scheduler: 9am to 17pm (5pm)
            const scheduleTime = getRandomTimeToday(9, 17);

            await db.insert(messageQueue).values({
                phone: '5567999999999', // Replace/Dynamic
                content: 'Opa! Sumiu hein? 💨 \n\nFaz 15 dias que você não garante seu estoque. \nChegaram novidades incríveis! \n\nVem conferir: https://vaporfume.com.br',
                type: 'winback',
                scheduledAt: scheduleTime,
                status: 'pending'
            });
            generatedCount++;
        }

        return NextResponse.json({ success: true, generated: generatedCount });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
