import { getProduct } from '@/lib/actions';
import ProductView from '@/components/ProductView';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const product = await getProduct(slug);
    if (!product) return { title: 'Produto não encontrado' };

    return {
        title: `${product.name} | Vapor Fumê`,
        description: `Compre ${product.name} por R$ ${product.price.toFixed(2)} na Vapor Fumê. O melhor preço e entrega rápida.`,
        openGraph: {
            title: `${product.name} | Vapor Fumê`,
            description: `Compre ${product.name} por R$ ${product.price.toFixed(2)}.`,
            images: [product.image || '/assets/ref-mobile.jpg'],
        },
    };
}

export default async function ProductPage({ params }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1>Produto não encontrado</h1>
            </div>
        );
    }

    return <ProductView product={product} />;
}
