'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import BannerCarousel from '@/components/BannerCarousel';
import CategoryFilter from '@/components/CategoryFilter';
import ProductCard from '@/components/ProductCard';

export default function HomeClient({ products, categories }) {
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredProducts = activeCategory === 'all'
        ? products
        : products.filter(p => p.categoryId === activeCategory);

    const novidades = products.filter(p => ['Novidade', 'Lançamento'].includes(p.badge));
    const promocoes = products.filter(p => p.badge === 'Promoção' || (p.oldPrice && p.oldPrice > p.price));

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '40px' }}>
            <Header />

            <BannerCarousel />

            <main className="container pb-20" id="catalog">

                {/* Section: Novidades */}
                {novidades.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <span className="text-xl">✨</span>
                            <h2 className="text-xl font-bold text-gray-900">Novidades Chegando</h2>
                        </div>
                        <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 custom-scrollbar">
                            {novidades.map(product => (
                                <div key={product.id} className="w-[160px] flex-shrink-0">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section: Promoções */}
                {promocoes.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <span className="text-xl">🔥</span>
                            <h2 className="text-xl font-bold text-gray-900">Ofertas Imperdíveis</h2>
                        </div>
                        <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 custom-scrollbar">
                            {promocoes.map(product => (
                                <div key={product.id} className="w-[160px] flex-shrink-0">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        Todos os Produtos
                    </h2>
                    <span style={{ color: 'var(--text-secondary)' }}>
                        {filteredProducts.length} itens
                    </span>
                </div>

                <CategoryFilter
                    categories={categories}
                    activeCategory={activeCategory}
                    onSelect={setActiveCategory}
                />

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '16px',
                    paddingBottom: '80px'
                }}>
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </main>
        </div>
    );
}
