'use client';

import { useState } from 'react';
import Link from 'next/link'; // Ensure Link is imported if needed, or remove unused imports
import Header from '@/components/Header';
import BannerCarousel from '@/components/BannerCarousel';
import ProductCard from '@/components/ProductCard';

export default function HomeClient({ products, categories }) {
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredProducts = activeCategory === 'all'
        ? products
        : products.filter(p => p.categoryId === activeCategory);

    const novidades = products.filter(p => ['Novidade', 'Lançamento'].includes(p.badge));
    const promocoes = products.filter(p => p.badge === 'Promoção' || (p.oldPrice && p.oldPrice > p.price));

    return (
        <div className="min-h-screen pb-10">
            <Header />
            <BannerCarousel />

            <div className="container py-6 grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Sidebar (Desktop) / TopBar (Mobile) */}
                <aside className="md:col-span-1">
                    {/* Mobile: Horizontal Scroll */}
                    <div className="md:hidden overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveCategory('all')}
                                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${activeCategory === 'all'
                                        ? 'bg-[var(--primary)] text-black shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Todos
                            </button>
                            {categories.filter(c => c.name !== 'Todos').map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${activeCategory === cat.id
                                            ? 'bg-[var(--primary)] text-black shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Desktop: Vertical Sidebar */}
                    <div className="hidden md:flex flex-col gap-2 sticky top-24">
                        <h3 className="font-bold text-lg mb-2 px-2">Categorias</h3>
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`text-left px-4 py-3 rounded-xl font-medium transition-colors ${activeCategory === 'all'
                                    ? 'bg-[var(--primary)] text-black shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Todos
                        </button>
                        {categories.filter(c => c.name !== 'Todos').map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`text-left px-4 py-3 rounded-xl font-medium transition-colors ${activeCategory === cat.id
                                        ? 'bg-[var(--primary)] text-black shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="md:col-span-3" id="catalog">

                    {/* Sections: Novidades & Promoções (Only show when 'all' is active to avoid clutter) */}
                    {activeCategory === 'all' && (
                        <>
                            {novidades.length > 0 && (
                                <div className="mb-10">
                                    <div className="flex items-center gap-2 mb-4">
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

                            {promocoes.length > 0 && (
                                <div className="mb-10">
                                    <div className="flex items-center gap-2 mb-4">
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
                        </>
                    )}

                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {activeCategory === 'all' ? 'Todos os Produtos' : categories.find(c => c.id === activeCategory)?.name || 'Produtos'}
                        </h2>
                        <span className="text-gray-500 text-sm font-medium">
                            {filteredProducts.length} itens
                        </span>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl">
                            <p className="text-gray-500">Nenhum produto encontrado nesta categoria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
