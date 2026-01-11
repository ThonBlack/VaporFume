import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, variants, apiKeys, tenants } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

// GET /api/v1/products
export async function GET(request) {
    const auth = await validateRequest(request);
    if (auth.error) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        const allProducts = await db.query.products.findMany({
            with: { variants: true },
            where: auth.tenantId ? eq(products.tenantId, auth.tenantId) : undefined,
        });

        return NextResponse.json({
            success: true,
            count: allProducts.length,
            data: allProducts.map(p => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                price: p.price,
                oldPrice: p.oldPrice,
                image: p.image,
                description: p.description,
                badge: p.badge,
                variants: p.variants?.map(v => ({
                    id: v.id,
                    name: v.name,
                    stock: v.stock,
                })) || []
            }))
        });
    } catch (error) {
        console.error('API Products Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
