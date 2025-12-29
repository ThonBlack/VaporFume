'use server';

import { db } from '@/lib/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
    return await db.select().from(categories);
}

export async function createCategory(data) {
    const slug = data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    await db.insert(categories).values({
        id: crypto.randomUUID(),
        name: data.name,
        slug: slug,
    });

    revalidatePath('/admin/categories');
}

export async function deleteCategory(id) {
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath('/admin/categories');
}
