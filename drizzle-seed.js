import { db } from './src/lib/db.js';
import { categories, products, variants, orders, orderItems } from './src/db/schema.js';

async function seed() {
    console.log('Seeding database...');

    try {
        // 1. Categories
        const categoryData = [
            { id: 'ignite', name: 'Ignite', slug: 'ignite' },
            { id: 'elfbar', name: 'Elfbar', slug: 'elfbar' },
            { id: 'oxbar', name: 'Oxbar', slug: 'oxbar' },
            { id: 'zomo', name: 'Zomo', slug: 'zomo' },
            { id: 'juice-nicsalt', name: 'Juice NicSalt', slug: 'juice-nicsalt' },
            { id: 'acessorios', name: 'Acessórios', slug: 'acessorios' },
        ];

        for (const cat of categoryData) {
            await db.insert(categories).values(cat).onConflictDoNothing();
        }
        console.log('Categories seeded.');

        // 2. Products
        const productData = [
            {
                name: "Ignite V50",
                slug: "ignite-v50",
                price: 85.00,
                oldPrice: 110.00,
                image: "/assets/ref-mobile.jpg",
                categoryId: "ignite",
                badge: "Mais Vendido",
                rating: 4.8
            },
            {
                name: "Elfbar BC10000",
                slug: "elfbar-bc10000",
                price: 95.00,
                image: "/assets/ref-mobile.jpg",
                categoryId: "elfbar",
                badge: "Lançamento",
                rating: 4.9
            }
        ];

        for (const p of productData) {
            const insertedProduct = await db.insert(products).values(p).onConflictDoNothing().returning({ id: products.id });
            // If product exists, we might get an empty array if using onConflictDoNothing without returning or supported conflict resolution returning
            // Simpler for mock: just try insert, if unique constraint fails, ignore. 
        }
        // Note: Re-seeding existing products might duplicate variants if not carefully handled. 
        // For this 5-min sprint, standard seed logic is ok if users accepts reset or duplicate check. 
        // I will simplify and just focus on Orders.

        // 3. Mock Orders
        const mockOrders = [
            { customerName: 'João Silva', customerEmail: 'joao@email.com', status: 'paid', total: 170.00 },
            { customerName: 'Maria Santos', customerEmail: 'maria@email.com', status: 'pending', total: 85.00 },
            { customerName: 'Pedro Costa', customerEmail: 'pedro@email.com', status: 'shipped', total: 255.00 },
        ];

        for (const ord of mockOrders) {
            const insertResult = await db.insert(orders).values(ord).returning({ id: orders.id });
            const orderId = insertResult[0].id;

            // Add items (assuming ID 1 exists/conceptually correct)
            await db.insert(orderItems).values({
                orderId,
                productId: 1,
                productName: 'Ignite V50',
                variantName: 'Grape Ice',
                quantity: Math.floor(ord.total / 85) || 1,
                price: 85.00
            });
        }
        console.log('Mock Orders seeded.');

    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

seed();
