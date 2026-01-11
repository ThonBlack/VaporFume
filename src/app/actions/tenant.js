'use server';

import { db } from '@/lib/db';
import { tenants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { writeFile } from 'fs/promises';
import path from 'path';

// Get tenant by slug (or default)
export async function getTenant(slug = 'default') {
    const tenant = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
    return tenant[0] || null;
}

// Get default tenant
export async function getDefaultTenant() {
    return getTenant('default');
}

// Update tenant settings
export async function updateTenant(tenantId, data) {
    await db.update(tenants)
        .set({
            name: data.name,
            logo: data.logo,
            favicon: data.favicon,
            primaryColor: data.primaryColor,
            secondaryColor: data.secondaryColor,
            backgroundColor: data.backgroundColor,
            msgRecovery: data.msgRecovery,
            msgWinback15: data.msgWinback15,
            msgWinback30: data.msgWinback30,
            msgWinback45: data.msgWinback45,
            msgRestock: data.msgRestock,
        })
        .where(eq(tenants.id, tenantId));

    return { success: true };
}

// Upload logo
export async function uploadTenantLogo(formData) {
    const file = formData.get('file');
    if (!file) return null;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `logo_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

    await writeFile(filepath, buffer);
    return `/uploads/${filename}`;
}
