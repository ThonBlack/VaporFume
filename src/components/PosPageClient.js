'use client';

import { useState } from 'react';
import PosProductGrid from '@/components/PosProductGrid';
import PosCart from '@/components/PosCart';
import { submitPosOrder } from '@/app/actions/pos-actions';
import { toast } from 'react-hot-toast'; // Assuming we have toast, if not we use alert

// This would strictly come from DB props in real implementation
export default function PosPage({ products }) {
    const [cart, setCart] = useState([]);

    const [selectedProductForVariant, setSelectedProductForVariant] = useState(null);

    // Cart Logic
    const handleProductClick = (product) => {
        // If product has variants, open modal
        // We need to know if it has variants. The 'products' prop usually has them nested?
        // Or we check if 'variants' array exists and has length > 0
        // In getProducts action, we enrich with variants.
        if (product.variants && product.variants.length > 0) {
            setSelectedProductForVariant(product);
        } else {
            addToCart(product);
        }
    };

    const addToCart = (product, variantName = null) => {
        setCart(prev => {
            // Unique ID based on product + variant
            const itemId = variantName ? `${product.id}-${variantName}` : product.id;
            const itemName = variantName ? `${product.name} - ${variantName}` : product.name;

            const existing = prev.find(item => item.uniqueId === itemId);
            if (existing) {
                return prev.map(item =>
                    item.uniqueId === itemId ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, {
                ...product,
                uniqueId: itemId, // critical for cart distinction
                name: itemName,
                quantity: 1,
                price: parseFloat(product.price),
                variant: variantName
            }];
        });
        setSelectedProductForVariant(null);
    };

    const updateQuantity = (item, delta) => {
        setCart(prev =>
            prev.map(i => {
                if (i.uniqueId === item.uniqueId) {
                    const newQty = Math.max(0, i.quantity + delta);
                    return { ...i, quantity: newQty };
                }
                return i;
            }).filter(i => i.quantity > 0)
        );
    };

    const removeFromCart = (item) => {
        setCart(prev => prev.filter(i => i.uniqueId !== item.uniqueId));
    };

    const [lastOrderId, setLastOrderId] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleCheckout = async ({ customerName, customerPhone, total, paymentMethod }) => {
        try {
            const orderId = await submitPosOrder({
                customerName: customerName || 'Venda Balcão',
                customerEmail: 'pdv@loja.com',
                customerPhone: customerPhone,
                total: total,
                paymentMethod: paymentMethod,
                items: cart.map(item => ({
                    productName: item.name,
                    productId: item.id,
                    variantName: item.variant,
                    quantity: item.quantity,
                    price: item.price
                })),
                isPos: true
            });

            // toast.success('Venda realizada!'); // Replaced by modal
            setCart([]);
            setLastOrderId(orderId);
            setShowSuccessModal(true);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao processar venda.');
        }
    };

    const handlePrint = () => {
        if (lastOrderId) {
            window.open(`/admin/orders/${lastOrderId}/print`, '_blank', 'width=400,height=600');
        }
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        setLastOrderId(null);
    };

    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'cart'

    // Calculate total items for badge
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] md:flex-row overflow-hidden bg-white md:bg-transparent">

            {/* Mobile Tab Navigation */}
            <div className="md:hidden flex border-b border-gray-200 bg-white">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex-1 p-3 text-sm font-semibold text-center ${activeTab === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                >
                    Produtos
                </button>
                <button
                    onClick={() => setActiveTab('cart')}
                    className={`flex-1 p-3 text-sm font-semibold text-center ${activeTab === 'cart' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                >
                    Carrinho ({totalItems})
                </button>
            </div>

            {/* Left: Products */}
            <div className={`flex-1 border-r border-gray-200 overflow-y-auto ${activeTab === 'products' ? 'block' : 'hidden md:block'}`}>
                {/* We pass handleProductClick instead of addToCart directly */}
                <PosProductGrid products={products} addToCart={handleProductClick} />
            </div>

            {/* Right: Cart */}
            <div className={`
                w-full md:w-96 bg-white z-20 shadow-xl 
                ${activeTab === 'cart' ? 'block flex-1' : 'hidden md:block'}
            `}>
                <PosCart
                    cart={cart}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                    onCheckout={handleCheckout}
                />
            </div>

            {/* Variant Selector Modal */}
            {selectedProductForVariant && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">{selectedProductForVariant.name}</h3>
                            <button onClick={() => setSelectedProductForVariant(null)} className="p-2 hover:bg-gray-200 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                            <p className="mb-3 text-sm text-gray-500">Selecione o sabor:</p>
                            <div className="grid grid-cols-1 gap-2">
                                {selectedProductForVariant.variants.map(v => (
                                    <button
                                        key={v.name}
                                        onClick={() => addToCart(selectedProductForVariant, v.name)}
                                        disabled={v.stock <= 0}
                                        className="flex items-center justify-between p-4 border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed group"
                                    >
                                        <span className="font-medium group-hover:text-blue-700">{v.name}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${v.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {v.stock > 0 ? `${v.stock} un.` : 'Esgotado'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Venda Realizada!</h2>
                        <p className="text-gray-500 mb-8">O pedido #{lastOrderId} foi salvo com sucesso.</p>

                        <div className="space-y-3">
                            <button
                                onClick={handlePrint}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                                Imprimir Cupom
                            </button>
                            <button
                                onClick={closeSuccessModal}
                                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Nova Venda
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
