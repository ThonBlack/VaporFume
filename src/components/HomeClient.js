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
        : products.filter(p => p.category === activeCategory); // p.category is slug/id

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '40px' }}>
            <Header />

            <BannerCarousel />

            <main className="container" id="catalog">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        Nossos Produtos
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
