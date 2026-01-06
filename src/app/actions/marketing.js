'use server';

import { db } from '@/lib/db';
import { orders, restockSubscriptions, favorites, customers, messageQueue } from '@/db/schema';
import { desc, isNotNull, and, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getCustomersForMarketing() {
    const allOrders = await db.select({
        name: orders.customerName,
        phone: orders.customerPhone,
        date: orders.createdAt,
        total: orders.total
    })
        .from(orders)
        .where(isNotNull(orders.customerPhone))
        .orderBy(desc(orders.createdAt));

    const uniqueCustomers = [];
    const seenPhones = new Set();

    for (const order of allOrders) {
        if (!order.phone) continue;
        const normalizedPhone = order.phone.replace(/\D/g, '');
        if (normalizedPhone.length < 10) continue;
        if (!seenPhones.has(normalizedPhone)) {
            seenPhones.add(normalizedPhone);
            uniqueCustomers.push({
                name: order.name,
                phone: normalizedPhone,
                lastOrderDate: order.date,
                totalSpent: order.total
            });
        }
    }
    return uniqueCustomers;
}

export async function getCustomersForEmail() {
    const allOrders = await db.select({
        name: orders.customerName,
        email: orders.customerEmail,
        date: orders.createdAt,
        total: orders.total
    })
        .from(orders)
        .where(isNotNull(orders.customerEmail))
        .orderBy(desc(orders.createdAt));

    const uniqueCustomers = [];
    const seenEmails = new Set();
    for (const order of allOrders) {
        if (!order.email) continue;
        const normalizedEmail = order.email.toLowerCase().trim();
        if (!seenEmails.has(normalizedEmail)) {
            seenEmails.add(normalizedEmail);
            uniqueCustomers.push({
                name: order.name,
                email: normalizedEmail,
                lastOrderDate: order.date,
                totalSpent: order.total
            });
        }
    }
    return uniqueCustomers;
}

export async function saveRestockSubscription(data) {
    const { productId, variantName, email, phone } = data;
    try {
        await db.insert(restockSubscriptions).values({
            productId,
            variantName,
            contactEmail: email,
            contactPhone: phone
        });
        return { success: true };
    } catch (error) {
        console.error('Error saving subscription:', error);
        return { success: false, error: 'Failed to save' };
    }
}

export async function saveFavorite(data) {
    const { productId, phone } = data;
    try {
        const existing = await db.select()
            .from(favorites)
            .where(and(eq(favorites.userPhone, phone), eq(favorites.productId, productId)))
            .get();

        if (existing) return { success: true, message: 'Already favorited' };

        await db.insert(favorites).values({
            userPhone: phone,
            productId
        });
        return { success: true };
    } catch (error) {
        console.error('Error saving favorite:', error);
        return { success: false, error: 'Failed to save' };
    }
}

// --- NEW UNIFIED FUNCTIONS ---

export async function getLeads() {
    // Combine Orders, Customers, Restock, Favorites into a single Leads list
    const leadsMap = new Map();

    const addLead = (phone, name, source, date) => {
        if (!phone) return;
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) return;

        if (!leadsMap.has(cleanPhone)) {
            leadsMap.set(cleanPhone, {
                phone: cleanPhone,
                name: name || 'Cliente',
                sources: new Set([source]),
                lastActive: new Date(date),
                totalSpent: 0
            });
        } else {
            const lead = leadsMap.get(cleanPhone);
            lead.sources.add(source);
            if (new Date(date) > lead.lastActive) lead.lastActive = new Date(date);
            if (name && lead.name === 'Cliente') lead.name = name;
        }
    };

    // 1. Orders
    const orderLeads = await db.select({ name: orders.customerName, phone: orders.customerPhone, date: orders.createdAt })
        .from(orders).where(isNotNull(orders.customerPhone));
    orderLeads.forEach(o => addLead(o.phone, o.name, 'Pedido', o.date));

    // 2. Customers
    try {
        const customerLeads = await db.select({
            name: customers.name,
            phone: customers.phone,
            date: customers.createdAt,
            origin: customers.origin
        }).from(customers).where(isNotNull(customers.phone));

        customerLeads.forEach(c => {
            let source = 'Cadastro';
            if (c.origin === 'import') source = 'Planilha';
            addLead(c.phone, c.name, source, c.date);
        });
    } catch (e) { } // Table might not exist yet if migration failed, safety catch

    // 3. Restock
    const restockLeads = await db.select({ phone: restockSubscriptions.contactPhone, date: restockSubscriptions.createdAt })
        .from(restockSubscriptions).where(isNotNull(restockSubscriptions.contactPhone));
    restockLeads.forEach(r => addLead(r.phone, 'Visitante Interessado', 'Avise-me', r.date));

    return Array.from(leadsMap.values()).map(l => ({
        ...l,
        sources: Array.from(l.sources),
        lastActive: l.lastActive.toISOString()
    })).sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
}

export async function getQueueStatus() {
    try {
        const now = Math.floor(Date.now() / 1000);

        // Items
        const items = await db.select().from(messageQueue).orderBy(desc(messageQueue.scheduledAt)).limit(50);

        // Stats
        const pending = await db.select({ count: sql`count(*)` }).from(messageQueue).where(eq(messageQueue.status, 'pending')).get();

        // Sent today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const startTs = Math.floor(startOfDay.getTime() / 1000);

        const sentToday = await db.select({ count: sql`count(*)` }).from(messageQueue)
            .where(and(eq(messageQueue.status, 'sent'), sql`sent_at >= ${startTs}`)).get();

        return {
            items,
            stats: {
                pending: pending.count,
                sentToday: sentToday.count
            }
        };
    } catch (e) {
        console.error('Queue Status Error', e);
        return { items: [], stats: { pending: 0, sentToday: 0 } };
    }
}

export async function addToQueue(data) {
    try {
        await db.insert(messageQueue).values({
            phone: data.phone.replace(/\D/g, ''),
            content: data.content,
            type: 'manual',
            status: 'pending',
            scheduledAt: Math.floor(Date.now() / 1000)
        });
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}


export async function removeFromQueue(id) {
    try {
        await db.delete(messageQueue).where(eq(messageQueue.id, id));
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

export async function importLeads(csvContent, originTag = 'Planilha Importada') {
    try {
        const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0);
        const validLeads = [];
        let skipped = 0;

        // Auto-detect delimiter from first few lines
        let delimiter = ',';
        const sample = lines.slice(0, 5).join('\n');
        if ((sample.match(/;/g) || []).length > (sample.match(/,/g) || []).length) {
            delimiter = ';';
        }

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Skip Header (loose check)
            if (i === 0) {
                const lower = line.toLowerCase();
                if (lower.includes('nome') || lower.includes('name') || lower.includes('phone') || lower.includes('telefone')) {
                    continue;
                }
            }

            // Split and Clean (remove quotes)
            const parts = line.split(delimiter).map(s => s?.trim().replace(/^["']|["']$/g, ''));

            // Naive mapping: assume Name is first, Phone is second logic, OR look for phone-like structure
            let [rawName, rawPhone] = parts;

            // If only 1 column, assume it's phone? No, risky.
            // If phone is invalid but name looks like phone, swap?
            if (rawName && /^\d+$/.test(rawName.replace(/\D/g, '')) && rawName.length > 8) {
                // Name looks like phone number
                if (!rawPhone || !/^\d+$/.test(rawPhone.replace(/\D/g, ''))) {
                    // Swap
                    const temp = rawName;
                    rawName = rawPhone || 'Cliente';
                    rawPhone = temp;
                }
            }

            if (!rawPhone || rawPhone.replace(/\D/g, '').length < 8) {
                skipped++;
                continue;
            }

            // Normalizar telefone
            let phone = rawPhone.replace(/\D/g, '');
            if (phone.length <= 11) phone = '55' + phone;

            validLeads.push({
                name: rawName || 'Cliente Importado',
                phone: phone,
                origin: 'import',
                tags: JSON.stringify([originTag]),
                password: 'default_password_hash',
                createdAt: new Date().toISOString()
            });
        }

        let inserted = 0;
        for (const lead of validLeads) {
            const existing = await db.select().from(customers).where(eq(customers.phone, lead.phone)).get();

            if (!existing) {
                await db.insert(customers).values(lead);
                inserted++;
            } else {
                skipped++;
            }
        }

        return { success: true, count: inserted, skipped };
    } catch (error) {
        console.error('Import Error:', error);
        return { success: false, error: error.message };
    }
}

export async function createCampaignBatch(message, batchSize = 50) {
    try {
        // 1. Select customers from 'import' origin who haven't received a campaign recently (or ever)
        // We prioritize those with NULL lastCampaignAt
        const candidates = await db.select()
            .from(customers)
            .where(
                and(
                    eq(customers.origin, 'import'),
                    sql`last_campaign_at IS NULL`
                )
            )
            .limit(batchSize);

        if (candidates.length === 0) {
            return { success: false, message: 'Nenhum contato novo da planilha para enviar.' };
        }

        const newMessages = [];
        const now = Math.floor(Date.now() / 1000);
        const isoNow = new Date().toISOString();

        for (const candidate of candidates) {
            // Personalize greeting
            const firstName = candidate.name ? candidate.name.split(' ')[0] : 'Cliente';
            let personalizedContent = message
                .replace(/{nome}/g, firstName)
                .replace(/{primeiro_nome}/g, firstName)
                .replace(/{nome_completo}/g, candidate.name || 'Cliente');

            newMessages.push({
                phone: candidate.phone,
                content: personalizedContent,
                type: 'campaign_import',
                status: 'pending',
                scheduledAt: now
            });

            // Update customer to mark as processed
            await db.update(customers)
                .set({ lastCampaignAt: isoNow })
                .where(eq(customers.id, candidate.id));
        }

        // Batch insert queue
        if (newMessages.length > 0) {
            await db.insert(messageQueue).values(newMessages);
        }

        revalidatePath('/admin/marketing');
        return { success: true, count: newMessages.length };

    } catch (e) {
        console.error('Campaign Batch Error:', e);
        return { success: false, error: e.message };
    }
}
