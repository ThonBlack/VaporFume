import { getProducts } from '@/lib/actions';

export default async function sitemap() {
    const products = await getProducts();
    const baseUrl = 'https://vaporfume.com.br'; // Replace with actual domain when known, or use env var

    const productUrls = products.map((product) => ({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...productUrls,
    ];
}
