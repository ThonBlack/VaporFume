import ProductForm from '@/components/ProductForm';
import { createProduct, getProducts } from '@/lib/actions';

export default async function NewProductPage() {
    const availableProducts = await getProducts();
    return <ProductForm action={createProduct} availableProducts={availableProducts} />;
}
