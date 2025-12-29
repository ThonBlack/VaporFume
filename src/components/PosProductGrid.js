'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';

export default function PosProductGrid({ products, addToCart }) {
    const [search, setSearch] = useState('');

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-gray-100">
            {/* Search Bar */}
            <div className="p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl outline-none transition-all"
                        placeholder="Buscar produtos..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map(product => (
                        <button
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col items-center group"
                        >
                            <div className="w-24 h-24 bg-gray-50 rounded-lg mb-3 relative overflow-hidden">
                                <img
                                    src={product.image || '/assets/ref-mobile.jpg'}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 text-center h-10 w-full">
                                {product.name}
                            </h3>
                            <p className="text-blue-600 font-bold mt-2">
                                R$ {parseFloat(product.price).toFixed(2)}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
