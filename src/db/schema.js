import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// === MULTI-TENANT ===
export const tenants = sqliteTable('tenants', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    // Visual Customization
    logo: text('logo'),
    favicon: text('favicon'),
    primaryColor: text('primary_color').default('#000000'),
    secondaryColor: text('secondary_color').default('#3b82f6'),
    backgroundColor: text('background_color').default('#ffffff'),
    // Message Templates
    msgRecovery: text('msg_recovery'),
    msgWinback15: text('msg_winback_15'),
    msgWinback30: text('msg_winback_30'),
    msgWinback45: text('msg_winback_45'),
    msgRestock: text('msg_restock'),
    // Meta
    createdAt: text('created_at').default(new Date().toISOString()),
});

export const categories = sqliteTable('categories', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    tenantId: integer('tenant_id').references(() => tenants.id),
});

export const settings = sqliteTable('settings', {
    key: text('key').primaryKey(),
    value: text('value'),
    tenantId: integer('tenant_id').references(() => tenants.id),
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
    tenantId: integer('tenant_id').references(() => tenants.id),
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
    address: text('address'), // JSON string or text address
    status: text('status').notNull().default('pending'),
    paymentMethod: text('payment_method'), // 'pix', 'credit_card', 'cash'
    total: real('total').notNull().default(0),
    recoveryStatus: text('recovery_status').default('none'), // none, sent, converted, failed
    recoverySentAt: text('recovery_sent_at'),
    createdAt: text('created_at').default(new Date().toISOString()),
    tenantId: integer('tenant_id').references(() => tenants.id),
});

export const orderItems = sqliteTable('order_items', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }),
    productId: integer('product_id').references(() => products.id),
    productName: text('product_name'),
    variantName: text('variant_name'),
    quantity: integer('quantity').notNull(),
    price: real('price').notNull(),
    costPrice: real('cost_price').default(0),
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

export const favorites = sqliteTable('favorites', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userPhone: text('user_phone').notNull(),
    productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
    createdAt: text('created_at').default(new Date().toISOString()),
});

export const restockSubscriptions = sqliteTable('restock_subscriptions', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
    variantName: text('variant_name'),
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),
    notified: integer('notified').default(0),
    createdAt: text('created_at').default(new Date().toISOString()),
});

export const messageQueue = sqliteTable('message_queue', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    phone: text('phone').notNull(),
    content: text('content').notNull(),
    type: text('type').default('winback'),
    status: text('status').default('pending'),
    scheduledAt: integer('scheduled_at').notNull(),
    sentAt: integer('sent_at'),
    createdAt: integer('created_at').default((Date.now() / 1000)),
});

export const customers = sqliteTable('customers', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    phone: text('phone').notNull().unique(),
    password: text('password').notNull(),
    name: text('name'),
    customerPhone: text('customer_phone'),
    address: text('address'), // JSON string or text address
    status: text('status').notNull().default('pending'),
    origin: text('origin').default('signup'), // signup, order, import
    tags: text('tags'), // JSON array of tags
    lastInteraction: text('last_interaction'), // ISO date of last msg received
    lastCampaignAt: text('last_campaign_at'), // ISO date of last mass msg sent
    createdAt: text('created_at').default(new Date().toISOString()),
});

// === COUPONS ===
export const coupons = sqliteTable('coupons', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    code: text('code').notNull().unique(),
    type: text('type').notNull().default('percent'), // 'percent' ou 'fixed'
    value: real('value').notNull(), // 10 = 10% ou R$10
    minOrderValue: real('min_order_value').default(0),
    maxUses: integer('max_uses'),
    usedCount: integer('used_count').default(0),
    expiresAt: text('expires_at'),
    active: integer('active').default(1),
    tenantId: integer('tenant_id').references(() => tenants.id),
    createdAt: text('created_at').default(new Date().toISOString()),
});

