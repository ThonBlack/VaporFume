import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, apiKeys } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// Validate API Key middleware
async function validateRequest(request) {
    const apiKey = request.headers.get('X-API-KEY');

    if (!apiKey) {
        return { error: 'API Key required', status: 401 };
    }

    const result = await db.select({
        id: apiKeys.id,
        tenantId: apiKeys.tenantId,
        active: apiKeys.active,
    })
        .from(apiKeys)
        .where(eq(apiKeys.key, apiKey))
        .limit(1);

    if (!result[0] || !result[0].active) {
        return { error: 'Invalid or inactive API Key', status: 403 };
    }

    // Update last used
    await db.update(apiKeys)
        .set({ lastUsedAt: new Date().toISOString() })
        .where(eq(apiKeys.id, result[0].id));

    return { tenantId: result[0].tenantId };
}

// GET /api/v1/orders
export async function GET(request) {
    const auth = await validateRequest(request);
    if (auth.error) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit')) || 50;
        const status = searchParams.get('status');

        const allOrders = await db.query.orders.findMany({
            with: { items: true },
            where: auth.tenantId ? eq(orders.tenantId, auth.tenantId) : undefined,
            orderBy: [desc(orders.createdAt)],
            limit,
        });

        // Filter by status if provided
        const filtered = status
            ? allOrders.filter(o => o.status === status)
            : allOrders;

        return NextResponse.json({
            success: true,
            count: filtered.length,
            data: filtered.map(o => ({
                id: o.id,
                status: o.status,
                total: o.total,
                customerName: o.customerName,
                customerPhone: o.customerPhone,
                customerEmail: o.customerEmail,
                address: o.address ? JSON.parse(o.address) : null,
                paymentMethod: o.paymentMethod,
                createdAt: o.createdAt,
                items: o.items?.map(i => ({
                    productName: i.productName,
                    variantName: i.variantName,
                    quantity: i.quantity,
                    price: i.price,
                })) || []
            }))
        });
    } catch (error) {
        console.error('API Orders Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
