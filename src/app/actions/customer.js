'use server';

import { db } from '@/lib/db';
import { customers } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

/**
 * Search customers by name or phone (POS Autocomplete)
 */
export async function searchCustomers(query) {
    if (!query || query.length < 2) return [];

    try {
        const results = await db.select({
            id: customers.id,
            name: customers.name,
            phone: customers.phone,
            customerPhone: customers.customerPhone,
            address: customers.address
        })
            .from(customers)
            .where(or(
                like(customers.name, `%${query}%`),
                like(customers.phone, `%${query}%`),
                like(customers.customerPhone, `%${query}%`)
            ))
            .limit(10);

        return results;
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

/**
 * Register a new customer
 */
export async function registerCustomer(phone, password, name) {
    if (!phone || !password) return { success: false, error: 'Dados inválidos.' };

    // 1. Check if exists
    try {
        const existing = await db.select().from(customers).where(eq(customers.phone, phone));
        if (existing.length > 0) {
            return { success: false, error: 'Telefone já cadastrado.' };
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Insert
        await db.insert(customers).values({
            phone,
            password: hashedPassword,
            name
        });
        return { success: true };
    } catch (error) {
        console.error('Register error:', error);
        return { success: false, error: 'Erro ao criar conta.' };
    }
}

/**
 * Login customer
 */
/**
 * Create a new customer (from POS)
 */
export async function createCustomer({ name, phone, address }) {
    if (!name || !phone) {
        return { success: false, error: 'Nome e telefone obrigatórios' };
    }

    try {
        // Check if already exists
        const existing = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
        if (existing.length > 0) {
            return { success: false, error: 'Telefone já cadastrado' };
        }

        await db.insert(customers).values({
            name,
            phone,
            customerPhone: phone,
            address: address || null
        });

        return { success: true };
    } catch (error) {
        console.error('Create customer error:', error);
        return { success: false, error: 'Erro ao criar cliente' };
    }
}

/**
 * Login customer
 */
export async function loginCustomer(phone, password) {
    if (!phone || !password) return { success: false, error: 'Dados incompletos.' };

    try {
        const user = await db.select().from(customers).where(eq(customers.phone, phone));

        if (user.length === 0) {
            return { success: false, error: 'Usuário não encontrado.' };
        }

        const isValid = await bcrypt.compare(password, user[0].password);

        if (!isValid) {
            return { success: false, error: 'Senha incorreta.' };
        }

        return { success: true, user: { phone: user[0].phone, name: user[0].name } };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Erro de servidor.' };
    }
}
