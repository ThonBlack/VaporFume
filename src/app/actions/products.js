'use server';

import { db } from '@/lib/db';
import { products } from '@/db/schema';
import { desc } from 'drizzle-orm';

/**
 * Get all products for admin listing/POS
 */
export async function getProducts() {
    return await db.select().from(products).orderBy(desc(products.id));
}
