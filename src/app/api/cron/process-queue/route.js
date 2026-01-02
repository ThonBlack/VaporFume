import { db } from '@/lib/db';
import { messageQueue } from '@/db/schema';
import { sql, eq, and, lte } from 'drizzle-orm';

// Mock sending function - Replace with real WhatsApp integration
async function sendWhatsApp(phone, content) {
    console.log(`[WHATSAPP MOCK] Sending to ${phone}: ${content}`);
    // In production, call your evolution-api or baileys instance here
    // await fetch('https://api.whatsapp.com...', ...)
    return true;
}

export async function GET() {
    try {
        const now = Math.floor(Date.now() / 1000);

        // Find pending messages scheduled for NOW or PAST
        const pending = await db.select()
            .from(messageQueue)
            .where(
                and(
                    eq(messageQueue.status, 'pending'),
                    lte(messageQueue.scheduledAt, now)
                )
            )
            .limit(10); // Process in batches to avoid timeout

        if (pending.length === 0) {
            return NextResponse.json({ success: true, processed: 0, message: 'No pending messages' });
        }

        const results = [];

        for (const msg of pending) {
            const sent = await sendWhatsApp(msg.phone, msg.content);

            if (sent) {
                await db.update(messageQueue)
                    .set({ status: 'sent', sentAt: Math.floor(Date.now() / 1000) })
                    .where(eq(messageQueue.id, msg.id));
                results.push({ id: msg.id, status: 'sent' });
            } else {
                await db.update(messageQueue)
                    .set({ status: 'failed' })
                    .where(eq(messageQueue.id, msg.id));
                results.push({ id: msg.id, status: 'failed' });
            }
        }

        return NextResponse.json({ success: true, processed: results.length, results });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
