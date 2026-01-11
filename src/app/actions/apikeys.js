'use server';

import { db } from '@/lib/db';
import { apiKeys, tenants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Generate a unique API key
function generateApiKey() {
    return `vf_sk_${crypto.randomBytes(24).toString('hex')}`;
}

// Get all API keys for admin
export async function getApiKeys() {
    return await db.select().from(apiKeys).orderBy(apiKeys.createdAt);
}

// Create new API key
export async function createApiKey(name, tenantId = 1) {
    const key = generateApiKey();
    const result = await db.insert(apiKeys).values({
        key,
        name,
        tenantId,
        active: 1,
    }).returning();

    return { success: true, apiKey: result[0] };
}

// Delete API key
export async function deleteApiKey(id) {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
    return { success: true };
}

// Toggle API key active status
export async function toggleApiKeyStatus(id) {
    const key = await db.select().from(apiKeys).where(eq(apiKeys.id, id)).limit(1);
    if (!key[0]) return { success: false };

    await db.update(apiKeys)
        .set({ active: key[0].active ? 0 : 1 })
        .where(eq(apiKeys.id, id));

    return { success: true };
}

// Validate API key and return tenant (for API middleware)
export async function validateApiKey(key) {
    const result = await db.select({
        id: apiKeys.id,
        tenantId: apiKeys.tenantId,
        active: apiKeys.active,
        tenantName: tenants.name,
        tenantSlug: tenants.slug,
    })
        .from(apiKeys)
        .leftJoin(tenants, eq(apiKeys.tenantId, tenants.id))
        .where(eq(apiKeys.key, key))
        .limit(1);

    if (!result[0] || !result[0].active) {
        return null;
    }

    // Update last used
    await db.update(apiKeys)
        .set({ lastUsedAt: new Date().toISOString() })
        .where(eq(apiKeys.id, result[0].id));

    return result[0];
}
