import { getProducts, getCategories } from '@/lib/actions';
import HomeClient from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await getProducts();
  const categoriesDb = await getCategories();

  const categories = [
    { id: 'all', name: 'Todos' },
    ...categoriesDb
  ];

  return <HomeClient products={products} categories={categories} />;
}
