const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
    { name: 'Ignite', slug: 'ignite' },
    { name: 'Elfbar', slug: 'elfbar' },
    { name: 'Oxbar', slug: 'oxbar' },
    { name: 'Zomo', slug: 'zomo' },
    { name: 'Juice NicSalt', slug: 'juice-nicsalt' },
];

const products = [
    {
        name: "Ignite V50",
        slug: "ignite-v50",
        price: 85.00,
        oldPrice: 110.00,
        image: "/assets/ref-mobile.jpg",
        badge: "Mais Vendido",
        rating: 4.8,
        category: 'ignite',
        variants: [
            { name: "Strawberry Kiwi", stock: 10 },
            { name: "Icy Mint", stock: 5 },
            { name: "Watermelon Ice", stock: 0 },
            { name: "Blueberry Ice", stock: 20 },
            { name: "Grape", stock: 15 },
        ]
    },
    {
        name: "Elfbar BC10000",
        slug: "elfbar-bc10000",
        price: 95.00,
        oldPrice: 120.00,
        image: "/assets/ref-mobile.jpg",
        badge: "Lançamento",
        category: 'elfbar',
        variants: [
            { name: "Peach Mango", stock: 10 },
            { name: "Strawberry Ice", stock: 0 },
            { name: "Triple Berry", stock: 12 }
        ]
    }
];

async function main() {
    console.log('Seeding database...');

    // Create Categories
    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
    }

    // Create Products
    for (const p of products) {
        const category = await prisma.category.findUnique({ where: { slug: p.category } });
        if (!category) continue;

        await prisma.product.upsert({
            where: { slug: p.slug },
            update: {},
            create: {
                name: p.name,
                slug: p.slug,
                price: p.price,
                oldPrice: p.oldPrice,
                image: p.image,
                badge: p.badge,
                rating: p.rating || 5.0,
                categoryId: category.id,
                variants: {
                    create: p.variants
                }
            }
        });
    }

    console.log('Database seeded successfully!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
