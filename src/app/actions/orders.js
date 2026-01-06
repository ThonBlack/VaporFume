'use server';

import { db } from '@/lib/db';
import { orders, orderItems, variants, products } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Busca todos os pedidos com paginação
 */
export async function getOrders(page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    const data = await db.query.orders.findMany({
        orderBy: [
            sql`CASE WHEN status = 'pending' THEN 0 ELSE 1 END`,
            desc(orders.createdAt)
        ],
        limit: limit,
        offset: offset,
        with: {
            items: true,
        }
    });

    // Contagem total para paginação
    const totalRes = await db.select({ count: sql`count(*)` }).from(orders);
    const total = totalRes[0].count;
    const totalPages = Math.ceil(total / limit);

    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages
        }
    };
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
        address: data.address ? JSON.stringify(data.address) : null,
        total: data.total,
        paymentMethod: data.paymentMethod || 'pix', // Default or from payload
        status: 'pending'
    }).returning({ id: orders.id });

    const orderId = orderResult[0].id;

    if (data.items && data.items.length > 0) {
        const itemsToInsert = [];

        for (const item of data.items) {
            // Fetch product to get Cost Price
            const productRes = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
            const product = productRes[0];

            itemsToInsert.push({
                orderId,
                productId: item.productId,
                productName: item.productName,
                variantName: item.variantName || (item.variants && item.variants.join(', ')),
                quantity: item.quantity,
                price: item.price,
                costPrice: product?.costPrice || 0
            });
        }

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

export async function deleteOrder(id) {
    // Delete items first (manual cascade just in case)
    await db.delete(orderItems).where(eq(orderItems.orderId, id));

    // Delete order
    await db.delete(orders).where(eq(orders.id, id));

    revalidatePath('/admin/orders');
}
