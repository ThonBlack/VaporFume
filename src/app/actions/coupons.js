'use server';

import { db } from '@/lib/db';
import { coupons } from '@/db/schema';
import { eq, and, gt, or, isNull } from 'drizzle-orm';

// Get all coupons
export async function getCoupons() {
    return await db.select().from(coupons).orderBy(coupons.createdAt);
}

// Get coupon by ID
export async function getCouponById(id) {
    const result = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
    return result[0] || null;
}

// Create coupon
export async function createCoupon(data) {
    const result = await db.insert(coupons).values({
        code: data.code.toUpperCase().trim(),
        type: data.type,
        value: parseFloat(data.value),
        minOrderValue: parseFloat(data.minOrderValue) || 0,
        maxUses: data.maxUses ? parseInt(data.maxUses) : null,
        expiresAt: data.expiresAt || null,
        active: data.active ? 1 : 0,
    }).returning();

    return { success: true, coupon: result[0] };
}

// Update coupon
export async function updateCoupon(id, data) {
    await db.update(coupons)
        .set({
            code: data.code.toUpperCase().trim(),
            type: data.type,
            value: parseFloat(data.value),
            minOrderValue: parseFloat(data.minOrderValue) || 0,
            maxUses: data.maxUses ? parseInt(data.maxUses) : null,
            expiresAt: data.expiresAt || null,
            active: data.active ? 1 : 0,
        })
        .where(eq(coupons.id, id));

    return { success: true };
}

// Delete coupon
export async function deleteCoupon(id) {
    await db.delete(coupons).where(eq(coupons.id, id));
    return { success: true };
}

// Toggle coupon active status
export async function toggleCouponStatus(id) {
    const coupon = await getCouponById(id);
    if (!coupon) return { success: false, error: 'Cupom não encontrado' };

    await db.update(coupons)
        .set({ active: coupon.active ? 0 : 1 })
        .where(eq(coupons.id, id));

    return { success: true };
}

// Validate and apply coupon
export async function validateCoupon(code, orderTotal) {
    const coupon = await db.select()
        .from(coupons)
        .where(eq(coupons.code, code.toUpperCase().trim()))
        .limit(1);

    if (!coupon[0]) {
        return { valid: false, error: 'Cupom não encontrado' };
    }

    const c = coupon[0];

    // Check if active
    if (!c.active) {
        return { valid: false, error: 'Cupom inativo' };
    }

    // Check expiration
    if (c.expiresAt && new Date(c.expiresAt) < new Date()) {
        return { valid: false, error: 'Cupom expirado' };
    }

    // Check max uses
    if (c.maxUses && c.usedCount >= c.maxUses) {
        return { valid: false, error: 'Cupom esgotado' };
    }

    // Check minimum order value
    if (c.minOrderValue && orderTotal < c.minOrderValue) {
        return { valid: false, error: `Pedido mínimo de R$ ${c.minOrderValue.toFixed(2)}` };
    }

    // Calculate discount
    let discount = 0;
    if (c.type === 'percent') {
        discount = (orderTotal * c.value) / 100;
    } else {
        discount = c.value;
    }

    // Don't exceed order total
    discount = Math.min(discount, orderTotal);

    return {
        valid: true,
        coupon: c,
        discount,
        discountFormatted: c.type === 'percent' ? `${c.value}%` : `R$ ${c.value.toFixed(2)}`
    };
}

// Increment coupon usage (call after successful checkout)
export async function useCoupon(couponId) {
    const coupon = await getCouponById(couponId);
    if (!coupon) return;

    await db.update(coupons)
        .set({ usedCount: (coupon.usedCount || 0) + 1 })
        .where(eq(coupons.id, couponId));
}
