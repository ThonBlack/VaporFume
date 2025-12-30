import { db } from '@/lib/db';
import { products, variants, categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import ProductForm from '@/components/ProductForm';
import { updateProduct } from '@/lib/actions';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }) {
    const { id } = await params;

    // Fetch product
    const productResults = await db.select().from(products).where(eq(products.id, parseInt(id)));
    const product = productResults[0];

    if (!product) {
        notFound();
    }

    // Fetch variants
    const productVariants = await db.select().from(variants).where(eq(variants.productId, parseInt(id)));

    // Fetch categories
    const allCategories = await db.select().from(categories);

    // Combine for form
    const initialData = {
        ...product,
        variants: productVariants
    };

    return <ProductForm action={updateProduct} initialData={initialData} categories={allCategories} />;
}
