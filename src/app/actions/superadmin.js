'use server';

import { db } from '@/lib/db';
import { tenants, orders, products } from '@/db/schema';
import { sql, eq, inArray } from 'drizzle-orm';

// Get all tenants with stats
export async function getAllTenants() {
    const allTenants = await db.select().from(tenants);

    // Get stats for each tenant
    const tenantsWithStats = await Promise.all(allTenants.map(async (tenant) => {
        const tenantOrders = await db.select()
            .from(orders)
            .where(eq(orders.tenantId, tenant.id));

        const paidOrders = tenantOrders.filter(o =>
            ['paid', 'Pago', 'completed'].includes(o.status)
        );

        const revenue = paidOrders.reduce((acc, o) => acc + o.total, 0);

        const tenantProducts = await db.select({ count: sql`count(*)` })
            .from(products)
            .where(eq(products.tenantId, tenant.id));

        return {
            ...tenant,
            stats: {
                totalOrders: tenantOrders.length,
                paidOrders: paidOrders.length,
                revenue,
                productCount: tenantProducts[0]?.count || 0
            }
        };
    }));

    return tenantsWithStats;
}

// Get global stats
export async function getGlobalStats() {
    const allOrders = await db.select().from(orders);
    const paidOrders = allOrders.filter(o =>
        ['paid', 'Pago', 'completed'].includes(o.status)
    );

    const totalRevenue = paidOrders.reduce((acc, o) => acc + o.total, 0);
    const allProducts = await db.select({ count: sql`count(*)` }).from(products);
    const allTenantsList = await db.select({ count: sql`count(*)` }).from(tenants);

    return {
        totalRevenue,
        totalOrders: allOrders.length,
        paidOrders: paidOrders.length,
        totalProducts: allProducts[0]?.count || 0,
        totalTenants: allTenantsList[0]?.count || 0,
    };
}

// Create new tenant
export async function createTenant(data) {
    const slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    try {
        const result = await db.insert(tenants).values({
            slug,
            name: data.name,
            logo: data.logo || null,
            primaryColor: data.primaryColor || '#000000',
            secondaryColor: data.secondaryColor || '#3b82f6',
        }).returning();

        return { success: true, tenant: result[0] };
    } catch (error) {
        return { success: false, error: 'Slug já existe ou erro ao criar' };
    }
}
