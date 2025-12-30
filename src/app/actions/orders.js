'use server';

import { db } from '@/lib/db';
import { orders, orderItems, variants, products } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Busca todos os pedidos com paginação
 */
export async function getOrders(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const data = await db.query.orders.findMany({
        orderBy: [desc(orders.createdAt)],
        limit: limit,
        offset: offset,
        with: {
            items: true,
        }
    });

    // Contagem total para paginação (opcional por enquanto, mas boa prática)
    // const total = await db.select({ count: sql`count(*)` }).from(orders);

    return data;
}

/**
 * Busca um pedido pelo ID com seus itens
 */
export async function getOrderById(id) {
    const order = await db.query.orders.findFirst({
        where: eq(orders.id, id),
        with: {
            items: {
                with: {
                    product: true
                }
            }
        }
    });
    return order;
}

/**
 * Atualiza o status de um pedido
 */
export async function updateOrderStatus(id, status) {
    await db.update(orders)
        .set({ status })
        .where(eq(orders.id, id));

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${id}`);
}

/**
 * Cria um novo pedido (Útil para testes ou checkout futuro)
 */
export async function createOrder(data) {
    // data espera: { customerName, customerEmail, items: [{ productId, quantity, price, ... }] }

    // Transação seria ideal aqui, mas sqlite simples:
    const orderResult = await db.insert(orders).values({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        total: data.total,
        status: 'pending'
    }).returning({ id: orders.id });

    const orderId = orderResult[0].id;

    if (data.items && data.items.length > 0) {
        const itemsToInsert = data.items.map(item => ({
            orderId,
            productId: item.productId,
            productName: item.productName,
            variantName: item.variantName || (item.variants && item.variants.join(', ')),
            quantity: item.quantity,
            price: item.price
        }));

        await db.insert(orderItems).values(itemsToInsert);

        // Decrement Stock Logic
        for (const item of data.items) {
            // Fetch product to check if it's a kit (linkedProductId)
            const productRes = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
            const product = productRes[0];

            if (!product) continue;

            const targetProductId = product.linkedProductId || product.id;

            // Case A: Multi-variant selection (Kit or simple multi-select if supported)
            if (item.variants && Array.isArray(item.variants)) {
                for (const flavorName of item.variants) {
                    const variant = await db.query.variants.findFirst({
                        where: (fields, { and, eq }) => and(eq(fields.productId, targetProductId), eq(fields.name, flavorName))
                    });

                    if (variant) {
                        const newStock = Math.max(0, variant.stock - 1);
                        await db.update(variants)
                            .set({ stock: newStock })
                            .where(eq(variants.id, variant.id));
                    }
                }
            }
            // Case B: Single variant specified (Standard)
            else if (item.variantName) {
                const variant = await db.query.variants.findFirst({
                    where: (fields, { and, eq }) => and(eq(fields.productId, targetProductId), eq(fields.name, item.variantName))
                });

                if (variant) {
                    const newStock = Math.max(0, variant.stock - item.quantity);
                    await db.update(variants)
                        .set({ stock: newStock })
                        .where(eq(variants.id, variant.id));
                }
            }
            // Case C: No variant specified (Simple product fallback or POS)
            else {
                const variant = await db.query.variants.findFirst({
                    where: (fields, { eq }) => eq(fields.productId, targetProductId)
                });

                if (variant) {
                    const newStock = Math.max(0, variant.stock - item.quantity);
                    await db.update(variants)
                        .set({ stock: newStock })
                        .where(eq(variants.id, variant.id));
                }
            }
        }
    }

    revalidatePath('/admin/orders');
    return orderId;
}
