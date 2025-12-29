import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const categories = sqliteTable('categories', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
});

export const settings = sqliteTable('settings', {
    key: text('key').primaryKey(),
    value: text('value'),
});

export const products = sqliteTable('products', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    price: real('price').notNull(),
    costPrice: real('cost_price').default(0),
    oldPrice: real('old_price'),
    image: text('image'),
    rating: real('rating').default(0),
    badge: text('badge'),
    categoryId: text('category_id').references(() => categories.id),
    // Kit / Bundle Fields
    linkedProductId: integer('linked_product_id'), // If set, this product allows selecting variants from the linked product
    bundleSize: integer('bundle_size').default(1), // How many variants to select (e.g. 3 for "Kit 3")
    images: text('images'), // JSON array of additional image paths
});

export const variants = sqliteTable('variants', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    stock: integer('stock').notNull().default(0),
    image: text('image'), // Specific image for this variant
    productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
});

export const orders = sqliteTable('orders', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    customerName: text('customer_name').notNull(),
    customerEmail: text('customer_email'),
    customerPhone: text('customer_phone'),
    status: text('status').notNull().default('pending'),
    total: real('total').notNull().default(0),
    createdAt: text('created_at').default(new Date().toISOString()),
});

export const orderItems = sqliteTable('order_items', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }),
    productId: integer('product_id').references(() => products.id),
    productName: text('product_name'),
    variantName: text('variant_name'),
    quantity: integer('quantity').notNull(),
    price: real('price').notNull(),
});

export const productsRelations = relations(products, ({ many }) => ({
    variants: many(variants),
    orderItems: many(orderItems),
}));

export const variantsRelations = relations(variants, ({ one }) => ({
    product: one(products, {
        fields: [variants.productId],
        references: [products.id],
    }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
    items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
    product: one(products, {
        fields: [orderItems.productId],
        references: [products.id]
    })
}));
