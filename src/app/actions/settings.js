'use server';

import { db } from '@/lib/db';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Get all settings as a key-value object
 */
export async function getSettings() {
    const allSettings = await db.select().from(settings);

    // Convert array [{key: 'a', value: '1'}] to object {a: '1'}
    return allSettings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});
}

/**
 * Update multiple settings at once
 * @param {Object} data - Object with key-values to update
 */
export async function updateSettings(data) {
    for (const [key, value] of Object.entries(data)) {
        // Upsert logic manually since sqlite INSERT OR REPLACE can be tricky in specific ORM versions
        // Simple check: try update, if nothing updated, insert.

        const existing = await db.select().from(settings).where(eq(settings.key, key));

        if (existing.length > 0) {
            await db.update(settings)
                .set({ value })
                .where(eq(settings.key, key));
        } else {
            await db.insert(settings).values({ key, value });
        }
    }

    revalidatePath('/admin/settings');
    revalidatePath('/checkout');
}

import fs from 'node:fs/promises';
import path from 'node:path';

export async function uploadBannerImage(formData) {
    const file = formData.get('file');

    if (!file || file.size === 0) {
        throw new Error('Nenhum arquivo enviado.');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `banner-${Date.now()}${path.extname(file.name)}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Ensure dir exists
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    return `/uploads/${filename}`;
}
