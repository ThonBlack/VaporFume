import { getProducts } from '@/app/actions/products'; // Assume this exists or use db call
import PosPageClient from '@/components/PosPageClient';
import { db } from '@/lib/db'; // Direct DB call if action doesn't exist yet
import { products as productsTable } from '@/db/schema';

export default async function AdminPosPage() {
    // Fetch products for POS
    const products = await db.select().from(productsTable);

    return <PosPageClient products={products} />;
}
