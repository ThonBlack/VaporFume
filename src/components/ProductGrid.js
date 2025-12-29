'use client';

import { useState } from 'react';
import CategoryFilter from '@/components/CategoryFilter';
import ProductCard from '@/components/ProductCard';

export default function ProductGrid({ initialProducts, categories }) {
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredProducts = activeCategory === 'all'
        ? initialProducts
        : initialProducts.filter(p => p.category === activeCategory);

    return (
        <>
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '20px'
            }}>
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </>
    );
}
