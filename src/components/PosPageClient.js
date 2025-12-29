'use client';

import { useState } from 'react';
import PosProductGrid from '@/components/PosProductGrid';
import PosCart from '@/components/PosCart';
import { createOrder } from '@/app/actions/orders';
import { toast } from 'react-hot-toast'; // Assuming we have toast, if not we use alert

// This would strictly come from DB props in real implementation
export default function PosPage({ products }) {
    const [cart, setCart] = useState([]);

    // Cart Logic
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1, price: parseFloat(product.price) }];
        });
    };

    const updateQuantity = (product, delta) => {
        setCart(prev =>
            prev.map(item => {
                if (item.id === product.id) {
                    const newQty = Math.max(0, item.quantity + delta);
                    return { ...item, quantity: newQty };
                }
                return item;
            }).filter(item => item.quantity > 0)
        );
    };

    const removeFromCart = (product) => {
        setCart(prev => prev.filter(item => item.id !== product.id));
    };

    const [lastOrderId, setLastOrderId] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleCheckout = async ({ customerName, customerPhone, total, paymentMethod }) => {
        try {
            const orderId = await createOrder({
                customerName: customerName || 'Venda Balcão',
                customerEmail: 'pdv@loja.com',
                customerPhone: customerPhone,
                total: total,
                paymentMethod: paymentMethod,
                items: cart.map(item => ({
                    productName: item.name,
                    productId: item.id,
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
                <PosProductGrid products={products} addToCart={addToCart} />
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
                />
            </div>

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
