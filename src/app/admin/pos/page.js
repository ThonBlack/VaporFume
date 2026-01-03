import { getProducts } from '@/app/actions/products'; // Assume this exists or use db call
import PosPageClient from '@/components/PosPageClient';
import { db } from '@/lib/db'; // Direct DB call if action doesn't exist yet
import { products as productsTable } from '@/db/schema';

export const dynamic = 'force-dynamic';

export default async function AdminPosPage() {
    // Fetch products for POS with variants
    const products = await getProducts();

    return <PosPageClient products={products} />;
}
