'use server';

import { db } from '@/lib/db';
import { orders, orderItems, variants, products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function submitPosOrder(data) {
    console.log('[POS Action] Submitting Order:', data);

    try {
        // Transação seria ideal aqui, mas sqlite simples:
        const orderResult = await db.insert(orders).values({
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
            total: data.total,
            status: 'completed', // POS sales are completed immediately usually? Logic says 'pending' in original source, but usually POS = paid. Keeping 'pending' to be safe or 'completed' if user finishes payment.
            // Original code used 'pending'. The prompt in PosCart has payment buttons. 
            // If payment is 'cash', 'pix', 'credit_card', 'debit_card', usually it means paid.
            // Let's stick to 'completed' for POS to distinguish from pending checkout orders?
            // Actually, matching original behavior: 'pending'.
            status: 'pending',
            paymentMethod: data.paymentMethod || 'cash'
        }).returning({ id: orders.id });

        const orderId = orderResult[0].id;

        if (data.items && data.items.length > 0) {
            // 1. Prepare items with Cost Price (Fetch needed)
            const itemsToInsert = [];

            for (const item of data.items) {
                // Fetch product for Cost Price & Variant Stock Logic
                const productRes = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
                const product = productRes[0];

                // Fallback cost
                const costPrice = product ? (product.costPrice || 0) : 0;

                // Handle Variant Name (Client sends 'variant' or 'variantName')
                const variantName = item.variantName || item.variant || (item.variants && item.variants.join(', '));

                itemsToInsert.push({
                    orderId,
                    productId: item.productId,
                    productName: item.productName,
                    variantName: variantName,
                    quantity: item.quantity,
                    price: item.price,
                    costPrice: costPrice // SAVE COST PRICE
                });
            }

            await db.insert(orderItems).values(itemsToInsert);

            // 2. Decrement Stock
            for (const item of itemsToInsert) { // Use the pre-processed items
                if (!item.productId) continue;

                const productRes = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
                const product = productRes[0];
                if (!product) continue;

                const targetProductId = product.linkedProductId || product.id;

                if (item.variantName) {
                    const normalizedVariantName = item.variantName.trim();
                    console.log(`[POS Stock] Looking for variant: "${normalizedVariantName}" for Product ID: ${targetProductId}`);

                    // Try exact match first
                    let variant = await db.query.variants.findFirst({
                        where: (fields, { and, eq }) => and(eq(fields.productId, targetProductId), eq(fields.name, normalizedVariantName))
                    });

                    // If not found, try case-insensitive or loose match (if needed, but start with trim)
                    if (!variant) {
                        // Fallback: try to find by checking if DB name contains the variant name or vice versa
                        // Or select all variants and find in JS (safer for small lists)
                        const allVariants = await db.select().from(variants).where(eq(variants.productId, targetProductId));
                        variant = allVariants.find(v => v.name.trim().toLowerCase() === normalizedVariantName.toLowerCase());
                    }

                    if (variant) {
                        console.log(`[POS Stock] Decrementing stock for variant: ${variant.name} (Old: ${variant.stock})`);
                        const newStock = Math.max(0, variant.stock - item.quantity);
                        await db.update(variants).set({ stock: newStock }).where(eq(variants.id, variant.id));
                    } else {
                        console.warn(`[POS Stock] Variant not found: ${normalizedVariantName}`);
                    }
                } else {
                    // Fallback: Single variant product
                    console.log(`[POS Stock] No variant name, looking for default/any variant for Product ID: ${targetProductId}`);
                    const variant = await db.query.variants.findFirst({
                        where: (fields, { eq }) => eq(fields.productId, targetProductId)
                    });

                    if (variant) {
                        console.log(`[POS Stock] Decrementing stock for default variant: ${variant.name} (Old: ${variant.stock})`);
                        const newStock = Math.max(0, variant.stock - item.quantity);
                        await db.update(variants).set({ stock: newStock }).where(eq(variants.id, variant.id));
                    }
                }
            }
        }

        revalidatePath('/admin/orders');
        revalidatePath('/admin/pos');

        return orderId;

    } catch (error) {
        console.error('[POS Action Error]', error);
        throw new Error('Erro ao salvar venda no servidor.');
    }
}
