export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/admin/',
        },
        sitemap: 'https://vaporfume.com.br/sitemap.xml', // Replace domain later
    };
}
