'use server';

import { db } from '@/lib/db';
import { products, variants } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

/**
 * Get all products for admin listing/POS (Includes Variants)
 */
export async function getProducts() {
    const allProducts = await db.select().from(products).orderBy(desc(products.id));

    // Enrich with variants
    const productsWithVariants = await Promise.all(allProducts.map(async (p) => {
        const pVariants = await db.select().from(variants).where(eq(variants.productId, p.id));
        return { ...p, variants: pVariants };
    }));

    return productsWithVariants;
}

export async function getUniqueVariantNames() {
    const results = await db.selectDistinct({ name: variants.name }).from(variants);
    return results.map(r => r.name).sort();
}
