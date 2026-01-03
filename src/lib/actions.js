'use server';

import { db } from './db';
import { products, categories, variants, orderItems, favorites, messageQueue, settings, restockSubscriptions } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getProducts() {
    try {
        const allProducts = await db.select().from(products).orderBy(desc(products.id));
        const allCategories = await db.select().from(categories);

        // Create a map for faster lookup: id -> name
        const categoryMap = {};
        allCategories.forEach(c => { categoryMap[c.id] = c.name; });

        // Enrich with variants and category name
        const productsWithDetails = await Promise.all(allProducts.map(async (p) => {
            const pVariants = await db.select().from(variants).where(eq(variants.productId, p.id));

            return {
                ...p,
                variants: pVariants,
                category: categoryMap[p.categoryId] || p.categoryId // Fallback to ID if not found
            };
        }));

        return productsWithDetails;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

export async function getCategories() {
    try {
        return await db.select().from(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

export async function getProduct(slug) {
    console.log('Fetching product with slug:', slug); // DEBUG
    try {
        const productResult = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
        const product = productResult[0];
        console.log('Product found:', product ? product.name : 'null'); // DEBUG

        if (!product) return null;

        // If Kit, fetch variants from linked product. Otherwise from self.
        const targetProductId = product.linkedProductId || product.id;

        const pVariants = await db.select().from(variants).where(eq(variants.productId, targetProductId));

        return {
            ...product,
            variants: pVariants,
            category: product.categoryId
        };
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

export async function createProduct(formData) {
    const name = formData.get('name');
    const price = parseFloat(formData.get('price'));
    // const oldPrice = parseFloat(formData.get('oldPrice')) || null;
    const categoryId = formData.get('categoryId'); // This is the ID/slug
    const description = formData.get('description');
    const variantsJson = formData.get('variants'); // Expecting JSON string of [{name, stock}]
    const linkedProductId = formData.get('linkedProductId') ? parseInt(formData.get('linkedProductId')) : null;
    const bundleSize = formData.get('bundleSize') ? parseInt(formData.get('bundleSize')) : 1;

    // Multi-Image Handling
    const fs = require('fs');
    const path = require('path');

    // Configurable Upload Directory
    // In production (VPS), use /var/www to avoid permission issues with /root
    const isProduction = process.env.NODE_ENV === 'production';
    const uploadDir = isProduction
        ? '/var/www/vaporfume-uploads'
        : path.join(process.cwd(), 'public', 'uploads');

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const savedImages = [];
    // Process main images (image_0 to image_4)
    for (let i = 0; i < 5; i++) {
        const file = formData.get(`image_${i}`);
        if (file && file.size > 0) {
            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                const fileName = `${Date.now()}-img${i}-${file.name.replace(/\s+/g, '-')}`;
                const fullPath = path.join(uploadDir, fileName);
                fs.writeFileSync(fullPath, buffer);
                try { fs.chmodSync(fullPath, 0o644); } catch (e) { console.error('Chmod failed:', e); }

                savedImages.push(`/uploads/${fileName}`);
            } catch (e) {
                console.error(`Failed to upload image_${i}:`, e);
            }
        }
    }

    // Fallback: If no images uploaded but 'image' (old field) exists or just use savedImages[0]
    // We keep 'image' column as the main thumbnail (first uploaded image)
    const mainImage = savedImages.length > 0 ? savedImages[0] : '/assets/ref-mobile.jpg';

    // Capture variant images map
    // We need to process variants and look for corresponding files in formData
    const variantsWithImages = [];
    if (!linkedProductId && variantsJson) {
        const parsedVariants = JSON.parse(variantsJson);
        for (const v of parsedVariants) {
            const varFile = formData.get(`variant_image_${v.name}`);
            let varImagePath = null;

            if (varFile && varFile.size > 0) {
                try {
                    const buffer = Buffer.from(await varFile.arrayBuffer());
                    const fileName = `${Date.now()}-var-${v.name.replace(/\s+/g, '-')}-${varFile.name.replace(/\s+/g, '-')}`;
                    fs.writeFileSync(path.join(uploadDir, fileName), buffer);
                    varImagePath = `/uploads/${fileName}`;
                } catch (e) {
                    console.error(`Failed to upload variant image for ${v.name}:`, e);
                }
            }
            variantsWithImages.push({ ...v, image: varImagePath });
        }
    }

    try {
        // 1. Create Product
        const newProductResult = await db.insert(products).values({
            name,
            slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            description,
            price,
            oldPrice: parseFloat(formData.get('oldPrice')) || null,
            costPrice: parseFloat(formData.get('costPrice')) || 0,
            image: mainImage,
            images: JSON.stringify(savedImages), // Save all images
            rating: 5.0,
            badge: formData.get('badge') || null,
            categoryId,
            linkedProductId,
            bundleSize
        }).returning({ id: products.id });

        const newProductId = newProductResult[0].id;

        // 2. Create Variants
        if (!linkedProductId && variantsWithImages.length > 0) {
            for (const v of variantsWithImages) {
                await db.insert(variants).values({
                    name: v.name,
                    stock: parseInt(v.stock) || 0,
                    image: v.image, // Save variant image
                    productId: newProductId
                });
            }
        }

        revalidatePath('/admin/products');
        revalidatePath('/');
    } catch (error) {
        console.error('Error creating product:', error);
        // return { success: false, error: 'Failed to create product' };
    }

    redirect('/admin/products');
}

// ... (code omitted for brevity)

export async function deleteProduct(entry) {
    const id = entry instanceof FormData ? entry.get('id') : entry;

    try {
        // 1. Detach from Order Items (Preserve History)
        // We set productId to NULL so the order item remains but is no longer linked to the deleted product
        await db.update(orderItems)
            .set({ productId: null })
            .where(eq(orderItems.productId, parseInt(id)));

        // 2. Delete Product
        // Variants will be deleted automatically due to onDelete: 'cascade' in schema
        await db.delete(products).where(eq(products.id, parseInt(id)));

        revalidatePath('/admin/products');
        revalidatePath('/');
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

export async function updateProduct(formData) {
    const fs = require('fs');
    const path = require('path');

    const id = formData.get('id');
    const name = formData.get('name');
    const price = parseFloat(formData.get('price'));
    const categoryId = formData.get('categoryId');
    const description = formData.get('description');
    const variantsJson = formData.get('variants');
    const linkedProductId = formData.get('linkedProductId') ? parseInt(formData.get('linkedProductId')) : null;
    const bundleSize = formData.get('bundleSize') ? parseInt(formData.get('bundleSize')) : 1;

    console.log(`[updateProduct] Starting update for ID: ${id}`);

    if (!id || !name || !price) {
        console.error('Missing required fields');
        return; // Or throw
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const uploadDir = isProduction
        ? '/var/www/vaporfume-uploads'
        : path.join(process.cwd(), 'public', 'uploads');

    if (!fs.existsSync(uploadDir)) { fs.mkdirSync(uploadDir, { recursive: true }); }

    // 1. Fetch current product to check existing images
    let existingImages = [];
    try {
        const current = await db.select().from(products).where(eq(products.id, parseInt(id))).limit(1);
        if (current.length > 0 && current[0].images) {
            existingImages = JSON.parse(current[0].images);
        } else if (current.length > 0 && current[0].image) {
            existingImages = [current[0].image];
        }
    } catch (e) { console.error(`Error fetching current images: ${e}`); }

    // Initialize newImages with existing ones
    let newImages = [...existingImages];

    // 2. Process Main Images
    for (let i = 0; i < 5; i++) {
        const file = formData.get(`image_${i}`);
        if (file && typeof file === 'object' && file.size > 0) {
            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                const fileName = `${Date.now()}-img${i}-${file.name.replace(/\s+/g, '-')}`;
                const fullPath = path.join(uploadDir, fileName);

                fs.writeFileSync(fullPath, buffer);
                try { fs.chmodSync(fullPath, 0o644); } catch (e) { console.error('Chmod failed:', e); }

                // Update specific index
                newImages[i] = `/uploads/${fileName}`;
            } catch (e) {
                console.error(`Failed to upload image_${i}:`, e);
            }
        }
    }
    const finalImages = newImages;
    const mainImage = finalImages.length > 0 ? finalImages[0] : (existingImages[0] || '/assets/ref-mobile.jpg');

    // 3. Process Variants (Validation Phase)
    const variantsWithImages = [];
    if (!linkedProductId && variantsJson) {
        try {
            const parsedVariants = JSON.parse(variantsJson);
            // Fetch current variants for image preservation
            const currentVariants = await db.select().from(variants).where(eq(variants.productId, parseInt(id)));

            for (const v of parsedVariants) {
                const varFile = formData.get(`variant_image_${v.name}`);
                let varImagePath = null;

                // Check existing image
                const existingVar = currentVariants.find(ev => ev.name === v.name);
                varImagePath = existingVar ? existingVar.image : null;

                if (varFile && varFile.size > 0) {
                    try {
                        const buffer = Buffer.from(await varFile.arrayBuffer());
                        const fileName = `${Date.now()}-var-${v.name.replace(/\s+/g, '-')}-${varFile.name.replace(/\s+/g, '-')}`;
                        const fullPath = path.join(uploadDir, fileName);
                        fs.writeFileSync(fullPath, buffer);
                        try { fs.chmodSync(fullPath, 0o644); } catch (e) { }
                        varImagePath = `/uploads/${fileName}`;
                    } catch (e) {
                        console.error(`Failed to upload variant image for ${v.name}: ${e}`);
                    }
                }
                variantsWithImages.push({ ...v, image: varImagePath });
            }
        } catch (e) {
            console.error(`Error processing variants JSON: ${e}`);
            throw new Error("Invalid variants data"); // Stop execution to prevent deleting distinct variants
        }
    }

    try {
        // 4. Update Product in DB
        const updateData = {
            name,
            price,
            oldPrice: parseFloat(formData.get('oldPrice')) || null,
            costPrice: parseFloat(formData.get('costPrice')) || 0,
            categoryId,
            description,
            linkedProductId,
            bundleSize,
            image: mainImage,
            badge: formData.get('badge') || null,
            images: JSON.stringify(finalImages)
        };

        await db.update(products).set(updateData).where(eq(products.id, parseInt(id)));

        // 5. Update Variants (Safe Delete & Insert)
        if (!linkedProductId) {
            // Only proceed if we successfully parsed variants above
            if (variantsJson) { // If we have intent to update variants
                // FETCH OLD VARIANTS STOCK for comparison
                const oldVariants = await db.select().from(variants).where(eq(variants.productId, parseInt(id)));

                await db.delete(variants).where(eq(variants.productId, parseInt(id)));

                for (const v of variantsWithImages) {
                    await db.insert(variants).values({
                        name: v.name,
                        stock: parseInt(v.stock) || 0,
                        image: v.image,
                        productId: parseInt(id)
                    });

                    // RESTOCK NOTIFICATION LOGIC
                    try {
                        const newStock = parseInt(v.stock) || 0;
                        const oldStock = oldVariants.find(ov => ov.name === v.name)?.stock || 0;

                        // Trigger if stock increased from 0 to > 0
                        if (oldStock <= 0 && newStock > 0) {
                            console.log(`[Restock] Detected restock for ${name} - ${v.name}`);

                            // Find subscribers
                            const subs = await db.select().from(restockSubscriptions)
                                .where(and(
                                    eq(restockSubscriptions.productId, parseInt(id)),
                                    eq(restockSubscriptions.variantName, v.name),
                                    eq(restockSubscriptions.notified, 0) // Only unnotified
                                ));

                            console.log(`[Restock] Found ${subs.length} subscribers`);

                            // Helper to get random time between start and end (timestamps in seconds)
                            const getRandomTime = (start, end) => Math.floor(Math.random() * (end - start + 1) + start);

                            // Helper to get next business window
                            const getNextBusinessWindow = () => {
                                const now = new Date();
                                const start = new Date(now);
                                start.setHours(9, 0, 0, 0);
                                const end = new Date(now);
                                end.setHours(17, 0, 0, 0);

                                // If now is after 17:00, move to tomorrow
                                if (now > end) {
                                    start.setDate(start.getDate() + 1);
                                    end.setDate(end.getDate() + 1);
                                }
                                // If now is before 09:00, use today's window (start is already set)

                                return { start: Math.floor(start.getTime() / 1000), end: Math.floor(end.getTime() / 1000) };
                            };

                            const window = getNextBusinessWindow();
                            // If currently inside window, distribution starts from now
                            const nowSec = Math.floor(Date.now() / 1000);
                            const distributionStart = Math.max(window.start, nowSec);
                            const distributionEnd = window.end;

                            for (const sub of subs) {
                                if (sub.contactPhone) {
                                    const message = `Olá! O produto *${name} (${v.name})* que você estava esperando chegou na Vapor Fumê! 💨\n\nGaranta o seu agora: https://vaporfume.shop/product/${updateData.slug || id}`;

                                    // Schedule randomly within the window
                                    // Ensure clean distribution if window is valid, otherwise fallback to delayed
                                    let scheduledAt = nowSec + 60; // default 1 min
                                    if (distributionEnd > distributionStart) {
                                        scheduledAt = getRandomTime(distributionStart, distributionEnd);
                                    }

                                    await db.insert(messageQueue).values({
                                        phone: sub.contactPhone,
                                        content: message,
                                        type: 'restock_alert',
                                        status: 'pending',
                                        scheduledAt: scheduledAt
                                    });

                                    // Mark as notified
                                    await db.update(restockSubscriptions)
                                        .set({ notified: 1, notifiedAt: new Date().toISOString() })
                                        .where(eq(restockSubscriptions.id, sub.id));
                                }
                            }
                        }
                    } catch (err) {
                        console.error('[Restock] Error processing notifications:', err);
                    }
                }
            }
        }

        revalidatePath('/admin/products');
        revalidatePath('/');
    } catch (error) {
        console.error(`CRITICAL ERROR updating product: ${error}`);
        // Consider returning error status instead of redirecting if possible, but action expects form submit
    }

    redirect('/admin/products');
}

export async function getFavorites(phone) {
    if (!phone) return [];
    try {
        const userFavs = await db.select()
            .from(favorites)
            .where(eq(favorites.userPhone, phone));

        if (userFavs.length === 0) return [];

        const productIds = userFavs.map(f => f.productId);

        // Fetch products that match the IDs
        // Drizzle doesn't have a simple 'inArray' in this version? It usually does `inArray(products.id, productIds)`.
        // Let's check imports. I need to import `inArray` from drizzle-orm.
        // If not, I can loop. `inArray` is better.
        // For now, let's just fetch all and filter or use Promise.all for safety if `inArray` is missing.
        // Safe approach: Promise.all
        const favProducts = await Promise.all(productIds.map(async (id) => {
            const res = await db.select().from(products).where(eq(products.id, id));
            return res[0];
        }));

        return favProducts.filter(Boolean);
    } catch (error) {
        console.error('Error getting favorites:', error);
        return [];
    }
}

export async function getAutomationData() {
    try {
        const queue = await db.select().from(messageQueue).orderBy(desc(messageQueue.createdAt)).limit(20);

        const statusRes = await db.select().from(settings).where(eq(settings.key, 'whatsapp_status'));
        const qrRes = await db.select().from(settings).where(eq(settings.key, 'whatsapp_qr'));

        const status = statusRes.length > 0 ? statusRes[0].value : 'disconnected';
        const qr = qrRes.length > 0 ? qrRes[0].value : '';

        return {
            queue,
            status,
            qr
        };
    } catch (error) {
        console.error('Error getting automation data:', error);
        return { queue: [], status: 'error', qr: null };
    }
}

export async function getCustomerOrders(phone) {
    if (!phone) return [];
    try {
        // Normalize phone if needed (remove non-digits)
        const cleanPhone = phone.replace(/\D/g, '');

        // Fetch orders for this phone, ordered by newest first
        const userOrders = await db.select().from(orders)
            .where(eq(orders.customerPhone, cleanPhone))
            .orderBy(desc(orders.createdAt));

        // Enrich with items? For listing, maybe we just need total/status/date.
        // If we want items, we can fetch them or leave it for a detail view.
        // Let's at least get the count of items or the first item name?
        // For simplicity/performance, let's just return orders first.
        // Actually, users like to see "Vape X + 2 others".

        return userOrders;
    } catch (error) {
        console.error('Error getting customer orders:', error);
        return [];
    }
}
