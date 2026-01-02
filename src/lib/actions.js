'use server';

import { db } from './db';
import { products, categories, variants, orderItems } from '../db/schema';
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
            badge: 'Novo',
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

export async function deleteProduct(formData) {
    const id = formData.get('id');

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
    const id = formData.get('id');
    const name = formData.get('name');
    const price = parseFloat(formData.get('price'));
    const categoryId = formData.get('categoryId');
    const description = formData.get('description');
    const variantsJson = formData.get('variants');
    const linkedProductId = formData.get('linkedProductId') ? parseInt(formData.get('linkedProductId')) : null;
    const bundleSize = formData.get('bundleSize') ? parseInt(formData.get('bundleSize')) : 1;

    console.log(`[updateProduct] Starting update for ID: ${id}`);

    console.log(`[updateProduct] Starting update for ID: ${id}`);

    const fs = require('fs');
    const path = require('path');

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

    // Initialize newImages with existing ones to preserve order
    let newImages = [...existingImages];

    // Ensure array has enough slots if we are adding to new indexes
    // If existing has 1 item, and we upload to index 4, we need newImages[4] to be set.
    // The previous logic `newImages[i] = ...` works fine for sparse arrays in JS, 
    // but when filtering `Boolean` later we just need to be careful not to lose "empty" slots if that was intended (it's not).

    for (let i = 0; i < 5; i++) {
        const file = formData.get(`image_${i}`);

        // Check if file object exists and has size
        if (file && typeof file === 'object' && file.size > 0) {
            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                const fileName = `${Date.now()}-img${i}-${file.name.replace(/\s+/g, '-')}`;
                // Ensure directory existence (redundant but safe)
                if (!fs.existsSync(uploadDir)) {
                    try {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    } catch (mkdirErr) {
                        console.error('Error creating upload dir:', mkdirErr);
                        throw new Error('Failed to create upload directory');
                    }
                }

                const fullPath = path.join(uploadDir, fileName);
                console.log(`[updateProduct] Writing file to: ${fullPath}`);
                fs.writeFileSync(fullPath, buffer);
                try { fs.chmodSync(fullPath, 0o644); } catch (e) { console.error('Chmod failed:', e); }

                const publicPath = `/uploads/${fileName}`;

                // CRITICAL: Overwrite the specific index.
                newImages[i] = publicPath;

            } catch (e) {
                console.error(`Failed to upload image_${i}:`, e);
                // Continue despite one image failing? Or throw?
                // Let's log and maybe not throw to save partial work, but user sees error 'server exception' usually denotes crash.
                // If we catch here, we avoid the 500 crash.
            }
        }
    }

    // Filter out nulls/undefined/empty strings, but ONLY if we want to compact. 
    // If original images were ['a', 'b', 'c'] and we updated index 1 to 'd', we have ['a', 'd', 'c'].
    // If original was ['a'] and we updated index 2 to 'b', we have ['a', empty, 'b'].
    // We should filter Boolean to remove empty slots.
    // FIX: Do NOT filter boolean if we want to preserve 5 slots? 
    // Actually our UI maps [0,1,2,3,4]. If we return ['a', 'b'], index 2 is undefined.
    // But if we have ['a', empty, 'b'] -> JSON stringify -> ["a",null,"b"].
    // The frontend doing `JSON.parse(images)[index]` will get null for index 1, and "b" for index 2.
    // If we FILTER, we get ["a", "b"]. Start UI: Index 0=a, Index 1=b. Index 2=null.
    // So the image "b" moves from slot 2 to slot 1 visually.
    // The user uploaded to slot 4 (index 4). If slots 0-3 are empty, we have [null, null, null, null, "img"].
    // Filter removes nulls -> ["img"].
    // UI displays "img" at index 0 (Cover).
    // The user sees it at index 0.
    // Wait, the user screenshot shows image at index 4 (last one) broken.
    // If it was filtered, it would be at index 0 (if others empty) or appended.
    // If the user *wants* specific slots, we should NOT filter.
    // Let's remove the filter to respect the slots.
    const finalImages = newImages; // .filter(Boolean); REMOVED FILTER to preserve slots

    const mainImage = finalImages.length > 0 ? finalImages[0] : '/assets/ref-mobile.jpg';

    // Variant Images Logic
    const variantsWithImages = [];

    if (!linkedProductId && variantsJson) {
        try {
            const parsedVariants = JSON.parse(variantsJson);
            const currentVariants = await db.select().from(variants).where(eq(variants.productId, parseInt(id)));

            for (const v of parsedVariants) {
                // Check if we uploaded a new image for this variant
                const varFile = formData.get(`variant_image_${v.name}`);
                let varImagePath = null;

                // Try to find existing variant image if we don't upload a new one
                // We need to match by name (as ID might change if we delete/recreate)
                const existingVar = currentVariants.find(ev => ev.name === v.name);
                varImagePath = existingVar ? existingVar.image : null;

                if (varFile && varFile.size > 0) {
                    try {
                        const buffer = Buffer.from(await varFile.arrayBuffer());
                        const fileName = `${Date.now()}-var-${v.name.replace(/\s+/g, '-')}-${varFile.name.replace(/\s+/g, '-')}`;
                        fs.writeFileSync(path.join(uploadDir, fileName), buffer);
                        varImagePath = `/uploads/${fileName}`;
                    } catch (e) {
                        console.error(`Failed to upload variant image for ${v.name}: ${e}`);
                    }
                }
                variantsWithImages.push({ ...v, image: varImagePath });
            }
        } catch (e) {
            console.error(`Error processing variants: ${e}`);
        }
    }

    try {
        // 1. Update Product
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
            images: JSON.stringify(finalImages)
        };

        await db.update(products).set(updateData).where(eq(products.id, parseInt(id)));

        // 2. Update Variants
        await db.delete(variants).where(eq(variants.productId, parseInt(id)));

        if (!linkedProductId && variantsWithImages.length > 0) {
            for (const v of variantsWithImages) {
                await db.insert(variants).values({
                    name: v.name,
                    stock: parseInt(v.stock) || 0,
                    image: v.image,
                    productId: parseInt(id)
                });
            }
        }

        revalidatePath('/admin/products');
        revalidatePath('/');
    } catch (error) {
        console.error(`CRITICAL ERROR updating product: ${error}`);
    }

    redirect('/admin/products');
}
