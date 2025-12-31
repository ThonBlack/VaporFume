'use client';

import { useState, useEffect } from 'react';
// import { useCart } from '@/lib/store'; // Assuming we have a cart store later, for now we will mock
import { processCheckout } from '@/app/actions/checkout';
import { calculateShipping } from '@/app/actions/shipping';
import { Loader2, CreditCard, MessageCircle, ArrowRight, CheckCircle2, Copy, ArrowLeft, Truck } from 'lucide-react';
import Image from 'next/image';

export default function CheckoutPage() {
    // Mock Cart removal -> Real Cart
    const [cart, setCart] = useState([]);
    const [isLoadingCart, setIsLoadingCart] = useState(true);

    const [step, setStep] = useState(1); // 1: Ident, 2: Payment, 3: Success
    const [formData, setFormData] = useState({
        name: '',
        cpf: '', // New CPF field
        email: '',
        phone: '',
        postalCode: '',
        address: '', // Street
        number: '', // House Number
        neighborhood: '', // Bairro
        city: '',
        state: ''
    });
    // Shipping State
    const [shippingCost, setShippingCost] = useState(0);
    const [shippingService, setShippingService] = useState(null); // 'Correios PAC', 'Motoboy', etc.
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const [shippingError, setShippingError] = useState(null);

    const [paymentMethod, setPaymentMethod] = useState('whatsapp');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('cart');
        if (stored) {
            setCart(JSON.parse(stored));
        }
        setIsLoadingCart(false);
    }, []);

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Format CPF
    const handleCpfChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 11) val = val.slice(0, 11);

        // Mask: 000.000.000-00
        if (val.length > 9) val = val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        else if (val.length > 6) val = val.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
        else if (val.length > 3) val = val.replace(/(\d{3})(\d{3})/, '$1.$2');

        setFormData(prev => ({ ...prev, cpf: val }));
    };

    // CEP Logic
    const handleCepChange = async (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 8) val = val.slice(0, 8);

        // Mask: 00000-000
        const formatted = val.length > 5 ? val.replace(/(\d{5})(\d{1,3})/, '$1-$2') : val;

        setFormData(prev => ({ ...prev, postalCode: formatted }));

        if (val.length === 8) {
            setIsCalculatingShipping(true);
            setShippingError(null);

            // 1. Fetch Address (ViaCEP)
            try {
                const res = await fetch(`https://viacep.com.br/ws/${val}/json/`);
                const data = await res.json();

                if (data.erro) {
                    setFormData(prev => ({ ...prev, address: '', city: '', state: '' })); // Clear
                    setShippingError('CEP não encontrado.');
                    setIsCalculatingShipping(false);
                    return;
                }

                // Update Address
                setFormData(prev => ({
                    ...prev,
                    address: data.logradouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf
                }));

                // 2. Calculate Shipping
                // Check if Uberaba
                const citySlug = data.localidade.toLowerCase().trim();
                const isUberaba = citySlug === 'uberaba' || (val.startsWith('380') || val.startsWith('381'));

                if (isUberaba) {
                    setShippingCost(0.00);
                    setShippingService('Entrega Grátis (Uberaba)');
                    setIsCalculatingShipping(false);
                } else {
                    // Call Server Action for Melhor Envio
                    const shippingRes = await calculateShipping(val);

                    if (shippingRes.error) {
                        setShippingError(shippingRes.error);
                        // Fallback fixed price if error
                        setShippingCost(25.90);
                        setShippingService('Frete Fixo (Erro no Cálculo)');
                    } else if (shippingRes.warning) {
                        setShippingCost(25.90);
                        setShippingService('Frete Fixo');
                    } else {
                        setShippingCost(shippingRes.price);
                        setShippingService(`Frete Correios (${shippingRes.service})`);
                    }
                    setIsCalculatingShipping(false);
                }

            } catch (err) {
                console.error('CEP Error:', err);
                setShippingError('Erro ao buscar CEP.');
                setIsCalculatingShipping(false);
            }
        } else {
            // Reset if CEP incomplete
            if (shippingCost !== 0) {
                setShippingCost(0);
                setShippingService(null);
            }
        }
    };


    const handleProcess = async () => {
        console.log('[Client Checkout] Button Clicked. Starting handleProcess...');
        setIsProcessing(true);
        try {
            if (typeof processCheckout !== 'function') {
                throw new Error('Server Action processCheckout is not defined! Check server logs.');
            }

            const res = await processCheckout({
                customerName: formData.name,
                customerEmail: formData.email,
                customerCPF: formData.cpf, // Pass CPF
                items: cart,
                total: cartTotal + shippingCost,
                paymentMethod: paymentMethod,
                customerPhone: formData.phone,
                customerPhone: formData.phone,
                customerAddress: `${formData.address}, ${formData.number} - ${formData.neighborhood}`, // Combine
                customerCity: formData.city,
                customerState: formData.state,
                customerZip: formData.postalCode,
                shippingService: shippingService // Save service name
            });

            console.log('[Client Checkout] Server Action Result:', res);

            if (res.error) {
                console.error('[Client Checkout] Error returned:', res.error);
                alert(res.error);
            } else {
                setResult(res);
                setStep(3);

                // Clear cart on success
                localStorage.removeItem('cart');
                window.dispatchEvent(new Event('storage')); // Notify other components if needed

                // If whatsapp, redirect automatically after short delay
                if (res.redirectUrl) {
                    setTimeout(() => {
                        window.location.href = res.redirectUrl;
                    }, 2000);
                }
            }
        } catch (err) {
            console.error('[Client Checkout] Exception caught:', err);
            alert('Erro ao processar pedido.');
        } finally {
            setIsProcessing(false);
            console.log('[Client Checkout] Process finished.');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Cópia realizada!');
    };

    if (isLoadingCart) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (cart.length === 0 && !result) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h1>
                <a href="/" className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition">
                    Voltar para a Loja
                </a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Finalizar Compra</h1>
                    <p className="mt-2 text-sm text-gray-500">Complete seus dados para receber seus produtos.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left Col: Summary */}
                    <div className="md:col-span-1 order-2 md:order-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-4">
                            <h3 className="text-lg font-semibold mb-4">Resumo</h3>
                            <div className="space-y-4 mb-4 border-b border-gray-50 pb-4">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="flex gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg relative overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.image || '/assets/ref-mobile.jpg'}
                                                className="w-full h-full object-cover"
                                                alt={item.productName}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                            {item.variants && Array.isArray(item.variants) ? (
                                                <p className="text-xs text-gray-500 mt-1">Sabores: {item.variants.join(', ')}</p>
                                            ) : item.variantName ? (
                                                <p className="text-xs text-gray-500 mt-1">Sabor: {item.variantName}</p>
                                            ) : null}
                                            <p className="text-xs font-semibold text-gray-900 mt-1">{item.quantity}x R$ {item.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 pt-4 border-t border-gray-50">
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span>R$ {cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>Frete</span>
                                    <span>{shippingCost === 0 && shippingService ? 'Grátis' : `R$ ${shippingCost.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2">
                                    <span>Total</span>
                                    <span>R$ {(cartTotal + shippingCost).toFixed(2)}</span>
                                </div>
                                {shippingService && (
                                    <div className="text-xs text-gray-500 text-right mt-1 flex items-center justify-end gap-1">
                                        <Truck className="w-3 h-3" /> {shippingService}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Steps */}
                    <div className="md:col-span-2 order-1 md:order-2">
                        {step === 1 && (
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">1</span>
                                    Seus Dados
                                </h2>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Personal Data */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                                            placeholder="Seu nome"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    {/* CPF Field - Required Only for Pix */}
                                    {paymentMethod === 'mercadopago' && (
                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">CPF (Obrigatório para Pix)</label>
                                            <input
                                                type="text"
                                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all font-mono"
                                                placeholder="000.000.000-00"
                                                value={formData.cpf}
                                                onChange={handleCpfChange}
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                            <input
                                                type="text"
                                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                                                placeholder="(11) 99999-9999"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                                                placeholder="seu@email.com"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Address Data */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                                                        placeholder="00000-000"
                                                        value={formData.postalCode || ''}
                                                        onChange={handleCepChange}
                                                        maxLength={9}
                                                    />
                                                    {isCalculatingShipping && (
                                                        <div className="absolute right-3 top-3">
                                                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                {shippingError && <p className="text-red-500 text-xs mt-1">{shippingError}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                                                <input
                                                    type="text"
                                                    disabled // Lock City
                                                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                                    placeholder="Cidade"
                                                    value={formData.city || ''}
                                                />
                                            </div>
                                        </div>

                                        {/* Google Review Prompt */}
                                        {shippingService === 'Entrega Grátis (Uberaba)' && (
                                            <div className="bg-blue-100 p-3 rounded-lg border border-blue-200 flex items-center gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                                <div className="text-sm text-blue-800">
                                                    <strong>Frete Grátis Liberado!</strong> (Uberaba)<br />
                                                    <span className="text-xs">Avalie a gente no Google e ajude a loja! ⭐</span>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Logradouro</label>
                                            <input
                                                type="text"
                                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                                                placeholder="Rua..."
                                                value={formData.address}
                                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                                                    placeholder="123"
                                                    value={formData.number}
                                                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                                                    placeholder="Bairro"
                                                    value={formData.neighborhood}
                                                    onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method Selector Moved Here or Step 2? */}
                                    {/* Keeping Logic: Step 1 is Data, Step 2 is Payment.
                                        But wait, if CPF is conditional on Payment Method, user must select Payment Method IN STEP 1 or PRIOR?
                                        Currently Payment Method is Step 2.
                                        
                                        User Requirement: "Preenchimento do CPF deixe disponivel apenas para quem optar pelo PIX"
                                        
                                        Problem: Step 1 is "Seus Dados", Step 2 is "Pagamento".
                                        Solution: Move Payment Method selection to Step 1 OR Ask "Como você quer pagar?" early.
                                        OR: Just Show CPF always but only MARK it required if they select Pix later?
                                        
                                        Better UX: Let's move Payment Selection to Step 1 bottom or Top.
                                        Let's put Payment Selection inside Step 1 for simplicity now.
                                     */}

                                    <div className="mt-4 border-t pt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Forma de Pagamento</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            <label className={`cursor-pointer border rounded-xl p-3 flex items-center gap-3 transition-all ${paymentMethod === 'whatsapp' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <input type="radio" name="payment_step1" className="w-4 h-4 text-green-600 focus:ring-green-500" checked={paymentMethod === 'whatsapp'} onChange={() => setPaymentMethod('whatsapp')} />
                                                <div className="flex items-center gap-2">
                                                    <MessageCircle className="w-5 h-5 text-green-600" />
                                                    <span className="text-sm font-medium text-gray-900">Combinar no WhatsApp</span>
                                                </div>
                                            </label>

                                            <label className={`cursor-pointer border rounded-xl p-3 flex items-center gap-3 transition-all ${paymentMethod === 'mercadopago' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <input type="radio" name="payment_step1" className="w-4 h-4 text-blue-600 focus:ring-blue-500" checked={paymentMethod === 'mercadopago'} onChange={() => setPaymentMethod('mercadopago')} />
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-white p-1 rounded border border-gray-100 w-6 h-6 flex items-center justify-center">
                                                        <img src="https://img.icons8.com/color/48/mercado-pago.png" className="w-full h-full object-contain" alt="Pix" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">Pix Automático (Mercado Pago)</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                </div>

                                <button
                                    onClick={handleProcess} // DIRECT PROCESS - Merge Step 1 & 2
                                    disabled={
                                        !formData.name ||
                                        (paymentMethod === 'mercadopago' && (!formData.cpf || formData.cpf.length < 14)) || // Conditionally Verify CPF
                                        !formData.phone ||
                                        !formData.email ||
                                        !formData.address ||
                                        !formData.number ||
                                        !formData.neighborhood ||
                                        !formData.city ||
                                        isCalculatingShipping ||
                                        (shippingCost === 0 && !shippingService) ||
                                        isProcessing
                                    }
                                    className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                                >
                                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalizar Pedido'} <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-black mb-4 flex items-center gap-1">
                                    <ArrowLeft className="w-3 h-3" /> Voltar
                                </button>
                                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">2</span>
                                    Pagamento
                                </h2>

                                <div className="grid grid-cols-1 gap-4">
                                    <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-4 transition-all ${paymentMethod === 'whatsapp' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="payment" className="w-5 h-5 text-green-600 focus:ring-green-500" checked={paymentMethod === 'whatsapp'} onChange={() => setPaymentMethod('whatsapp')} />
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-lg border border-gray-100">
                                                <MessageCircle className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <span className="font-semibold block text-gray-900">A Combinar (WhatsApp)</span>
                                                <span className="text-sm text-gray-500">Combine o pagamento e entrega pelo chat</span>
                                            </div>
                                        </div>
                                    </label>

                                    <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-4 transition-all ${paymentMethod === 'mercadopago' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="payment" className="w-5 h-5 text-blue-600 focus:ring-blue-500" checked={paymentMethod === 'mercadopago'} onChange={() => setPaymentMethod('mercadopago')} />
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-lg border border-gray-100">
                                                <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-livre-logo-icone.png" className="w-6 h-6 object-contain" alt="Pix" />
                                            </div>
                                            <div>
                                                <span className="font-semibold block text-gray-900">Pix Automático (Mercado Pago)</span>
                                                <span className="text-sm text-gray-500">Aprovação imediata + 5% de desconto</span>
                                            </div>
                                        </div>
                                    </label>

                                    <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-4 transition-all ${paymentMethod === 'card' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="payment" className="w-5 h-5 text-purple-600 focus:ring-purple-500" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-lg border border-gray-100">
                                                <CreditCard className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <span className="font-semibold block text-gray-900">Cartão de Crédito</span>
                                                <span className="text-sm text-gray-500">Até 12x (Link de Pagamento)</span>
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                <button
                                    onClick={handleProcess}
                                    disabled={isProcessing}
                                    className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalizar Pedido'}
                                </button>
                            </div>
                        )}

                        {step === 3 && result && (
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center animate-in zoom-in-95">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido Recebido!</h2>
                                <p className="text-gray-500 mb-8">Obrigado pela sua compra, {formData.name}.</p>

                                {/* WhatsApp Redirect Info */}
                                {result.redirectUrl && (
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-6">
                                        <p className="text-green-800 font-medium mb-2">Redirecionando para o WhatsApp...</p>
                                        <a href={result.redirectUrl} className="text-sm underline text-green-700">Clique aqui se não for redirecionado</a>
                                    </div>
                                )}

                                {/* Pix Display */}
                                {result.pixData && (
                                    <div className="space-y-4">
                                        <p className="font-medium text-gray-900">Escaneie o QR Code para pagar:</p>
                                        <div className="w-48 h-48 bg-gray-100 mx-auto rounded-lg overflow-hidden border border-gray-200 relative">
                                            <Image src={`data:image/png;base64,${result.pixData.qr_code_base64}`} fill className="object-contain" alt="Pix QR Code" />
                                        </div>
                                        <div className="flex gap-2">
                                            <input type="text" readOnly value={result.pixData.qr_code} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500 font-mono" />
                                            <button onClick={() => copyToClipboard(result.pixData.qr_code)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded border border-gray-200">
                                                <Copy className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400">O pagamento será confirmado automaticamente.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
