'use server';

import { db } from '@/lib/db';
import { products, variants } from '@/db/schema';
import { desc } from 'drizzle-orm';

/**
 * Get all products for admin listing/POS
 */
export async function getProducts() {
    return await db.select().from(products).orderBy(desc(products.id));
}

export async function getUniqueVariantNames() {
    const results = await db.selectDistinct({ name: variants.name }).from(variants);
    return results.map(r => r.name).sort();
}
