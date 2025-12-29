import ProductForm from '@/components/ProductForm';
import { createProduct, getProducts, getCategories } from '@/lib/actions';

export default async function NewProductPage() {
    const availableProducts = await getProducts();
    const categories = await getCategories();
    return <ProductForm action={createProduct} availableProducts={availableProducts} categories={categories} />;
}
