export const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'ignite', name: 'Ignite' },
    { id: 'elfbar', name: 'Elfbar' },
    { id: 'oxbar', name: 'Oxbar' },
    { id: 'zomo', name: 'Zomo' },
    { id: 'juice-nicsalt', name: 'Juice NicSalt' },
];

export const products = [
    {
        id: 1,
        name: "Ignite V50",
        slug: "ignite-v50",
        price: 85.00,
        oldPrice: 110.00,
        image: "/assets/ref-mobile.jpg",
        category: "ignite",
        badge: "Mais Vendido",
        rating: 4.8,
        // Updated structure: Array of objects with stock
        flavors: [
            { name: "Strawberry Kiwi", stock: 10 },
            { name: "Icy Mint", stock: 5 },
            { name: "Watermelon Ice", stock: 0 }, // Should be hidden
            { name: "Blueberry Ice", stock: 20 },
            { name: "Grape", stock: 15 },
            { name: "Banana Ice", stock: 8 }
        ]
    },
    {
        id: 2,
        name: "Elfbar BC10000",
        slug: "elfbar-bc10000",
        price: 95.00,
        oldPrice: 120.00,
        image: "/assets/ref-mobile.jpg",
        category: "elfbar",
        badge: "Lançamento",
        rating: 4.9,
        flavors: [
            { name: "Peach Mango", stock: 10 },
            { name: "Strawberry Ice", stock: 0 }, // Hidden
            { name: "Triple Berry", stock: 12 },
            { name: "Sakura Grape", stock: 5 }
        ]
    },
    {
        id: 3,
        name: "Oxbar Magic Maze",
        slug: "oxbar-magic-maze",
        price: 100.00,
        oldPrice: null,
        image: "/assets/ref-mobile.jpg",
        category: "oxbar",
        badge: null,
        rating: 4.7,
        flavors: [
            { name: "Blue Razz", stock: 10 },
            { name: "Lush Ice", stock: 10 },
            { name: "Mint", stock: 10 },
            { name: "Mango", stock: 10 }
        ]
    },
    {
        id: 4,
        name: "Juice Nasty 30ml",
        slug: "juice-nasty-30ml",
        price: 65.00,
        oldPrice: 80.00,
        image: "/assets/ref-mobile.jpg",
        category: "juice-nicsalt",
        badge: "Promoção",
        rating: 4.5,
        flavors: [
            { name: "Slow Blow", stock: 10 },
            { name: "Cush Man", stock: 10 },
            { name: "Bad Blood", stock: 10 },
            { name: "Trap Queen", stock: 10 }
        ]
    }
];
