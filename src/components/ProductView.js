'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { Star, ArrowLeft, Truck, Lock, MessageCircle, Heart, Share2, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { createOrder } from '@/app/actions/orders'; // We might use this for "Add to Cart" later, or use context. For now usually specific context.

export default function ProductView({ product }) {
    // Kit Logic: If bundle_size > 1, allow multi-select
    const isKit = product.bundleSize > 1;
    const maxSelect = product.bundleSize || 1;

    // State
    const [selectedFlavors, setSelectedFlavors] = useState([]); // Array of strings
    const [cep, setCep] = useState('');
    const [shippingResult, setShippingResult] = useState(null);

    // Provide backward compatibility if variants are called 'flavors' or 'variants'
    const availableVariants = product.variants?.filter(v => v.stock > 0) || [];

    const handleFlavorToggle = (flavorName) => {
        // Switch main image if variant has one
        const variant = availableVariants.find(v => v.name === flavorName);
        console.log('Flavor Clicked:', flavorName);
        console.log('Found Variant:', variant);

        if (variant && variant.image) {
            console.log('Setting Active Image to:', variant.image);
            setActiveImage(variant.image);
        } else {
            console.log('No image found for this variant');
        }

        if (isKit) {
            // Multi-select logic
            // Check count
            const currentCount = selectedFlavors.filter(f => f === flavorName).length;
            const totalSelected = selectedFlavors.length;
        } else {
            // Single select
            setSelectedFlavors([flavorName]);
        }
    };

    // Kit Specific: Add/Remove logic
    const addFlavorToKit = (flavorName) => {
        if (selectedFlavors.length < maxSelect) {
            setSelectedFlavors([...selectedFlavors, flavorName]);
        }
    };

    const removeFlavorFromKit = (flavorName) => {
        const index = selectedFlavors.indexOf(flavorName);
        if (index > -1) {
            const newFlavors = [...selectedFlavors];
            newFlavors.splice(index, 1);
            setSelectedFlavors(newFlavors);
        }
    };

    const countSelected = (flavorName) => selectedFlavors.filter(f => f === flavorName).length;

    const calculateShipping = () => {
        if (!cep) return;
        if (cep.startsWith('79')) {
            setShippingResult({ price: 0, days: '1 dia útil' });
        } else {
            setShippingResult({ price: 25.90, days: '4 a 12 dias úteis' });
        }
    };

    // Toast State
    const [showToast, setShowToast] = useState(false);

    const handleBuy = () => {
        const payload = {
            productId: product.id,
            productName: product.name,
            price: product.price,
            variants: selectedFlavors,
            isKit: isKit,
            image: activeImage
        };

        // Add to LocalStorage
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart.push({ ...payload, quantity: 1, uniqueId: Date.now() });
        localStorage.setItem('cart', JSON.stringify(cart));

        // Dispatch Event for Header updates
        window.dispatchEvent(new Event('cart-updated'));

        // Show Feedback
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
    };

    // Images Logic
    const [images, setImages] = useState(() => {
        if (product.images) {
            try {
                return JSON.parse(product.images);
            } catch (e) {
                return [product.image];
            }
        }
        return [product.image];
    });
    const [activeImage, setActiveImage] = useState(images[0] || '/assets/ref-mobile.jpg');

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '40px' }}>
            <Header />

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black">
                        <Truck size={16} />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Produto adicionado!</p>
                        <p className="text-xs text-gray-400">O que deseja fazer?</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                        <button onClick={() => setShowToast(false)} className="px-3 py-1 text-xs border border-gray-600 rounded-lg hover:bg-gray-800">
                            Continuar
                        </button>
                        <Link href="/cart">
                            <button className="px-3 py-1 text-xs bg-white text-black font-bold rounded-lg hover:bg-gray-200">
                                Ver Carrinho
                            </button>
                        </Link>
                    </div>
                </div>
            )}

            <main className="container" style={{ marginTop: '100px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <Link href="/" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                        <ArrowLeft size={16} /> Voltar
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 md:p-10 rounded-2xl shadow-sm">
                    {/* Left: Image Gallery */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center aspect-square relative group">
                            <img
                                src={activeImage}
                                alt={product.name}
                                className="w-4/5 h-4/5 object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`w-20 h-20 flex-shrink-0 rounded-lg border-2 overflow-hidden bg-gray-50 ${activeImage === img ? 'border-black' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div>
                        <div className="mb-4">
                            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
                                {product.name}
                            </h1>
                            {isKit && (
                                <span className="inline-block mt-2 bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                                    Combo Promocional
                                </span>
                            )}
                        </div>

                        <div className="mb-6">
                            {product.oldPrice && (
                                <span className="line-through text-gray-400 text-sm block">
                                    de R$ {product.oldPrice.toFixed(2)}
                                </span>
                            )}
                            <div>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-bold text-gray-900">
                                        R$ {product.price.toFixed(2)}
                                    </span>
                                    <span className="text-sm text-gray-500 mb-1 font-medium">à vista</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    ou em até <span className="font-bold text-gray-900">12x de R$ {((product.price * 1.2) / 12).toFixed(2)}</span> (no cartão)
                                </p>
                            </div>
                        </div>

                        {/* Flavors / Variants */}
                        {availableVariants.length > 0 && (
                            <div className="mb-8">
                                <span className="block mb-3 font-semibold text-gray-800 text-sm">
                                    {isKit
                                        ? `Escolha ${maxSelect} Sabores (${selectedFlavors.length}/${maxSelect})`
                                        : 'Escolha o Sabor'
                                    }
                                </span>

                                {isKit ? (
                                    // KIT UI: List with counters
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {availableVariants.map(v => {
                                            const qty = countSelected(v.name);
                                            const disabledAdd = selectedFlavors.length >= maxSelect;
                                            return (
                                                <div key={v.name} onClick={() => isKit && v.image && setActiveImage(v.image)} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                                    <span className="text-sm font-medium text-gray-700">{v.name}</span>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => removeFlavorFromKit(v.name)}
                                                            disabled={qty === 0}
                                                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-300"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-4 text-center font-bold text-gray-900">{qty}</span>
                                                        <button
                                                            onClick={() => addFlavorToKit(v.name)}
                                                            disabled={disabledAdd}
                                                            className={`w-8 h-8 flex items-center justify-center rounded-full text-white transition-colors ${disabledAdd ? 'bg-gray-300 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    // STANDARD UI: Buttons
                                    <div className="flex flex-wrap gap-2">
                                        {availableVariants.map(v => (
                                            <button
                                                key={v.name}
                                                onClick={() => handleFlavorToggle(v.name)}
                                                className={`
                                                    px-4 py-2 rounded-lg text-sm font-medium transition-all border
                                                    ${selectedFlavors.includes(v.name)
                                                        ? 'border-black bg-black text-white shadow-md'
                                                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                                    }
                                                `}
                                            >
                                                {v.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-4 mb-4">
                            <button
                                onClick={handleBuy}
                                disabled={selectedFlavors.length !== maxSelect}
                                className="w-full bg-blue-600 text-white h-14 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                            >
                                {selectedFlavors.length !== maxSelect
                                    ? (isKit ? `Escolha ${maxSelect - selectedFlavors.length} mais` : 'Selecione um Sabor')
                                    : 'Comprar Agora'
                                }
                            </button>
                        </div>

                        <div className="flex gap-6 mb-8 text-gray-500 text-sm">
                            <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                                <Heart size={18} /> Salvar favorito
                            </button>
                            <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                                <Share2 size={18} /> Compartilhar
                            </button>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <div className="flex items-center gap-2 mb-3 text-gray-900 font-semibold">
                                <Truck size={20} /> Calcular Frete
                            </div>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="Digite seu CEP"
                                    value={cep}
                                    onChange={(e) => setCep(e.target.value)}
                                    className="flex-1 p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                                />
                                <button onClick={calculateShipping} className="px-6 bg-gray-100 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                                    OK
                                </button>
                            </div>
                            {shippingResult && (
                                <div className="bg-green-50 text-green-800 p-3 rounded-lg text-sm">
                                    <p className="font-bold">{shippingResult.price === 0 ? 'Frete Grátis 🎉' : `R$ ${shippingResult.price.toFixed(2)}`}</p>
                                    <p>Prazo: {shippingResult.days}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
