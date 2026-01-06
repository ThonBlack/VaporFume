'use client';

import { useState } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, QrCode } from 'lucide-react';
import CustomerAutocomplete from './CustomerAutocomplete';

export default function PosCart({
    cart,
    updateQuantity,
    removeFromCart,
    onCheckout,
    customerName, setCustomerName,
    customerPhone, setCustomerPhone,
    paymentMethod, setPaymentMethod,
    discount, setDiscount
}) {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = Math.max(0, subtotal - (parseFloat(discount) || 0));

    const handleFinish = () => {
        onCheckout();
    }

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" /> Carrinho Atual
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                    <div className="text-center text-gray-400 mt-20">
                        Carrinho vazio.<br />Selecione produtos ao lado.
                    </div>
                ) : (
                    cart.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="flex justify-between items-start border-b border-gray-100 pb-4">
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                                <p className="text-xs text-gray-500">R$ {item.price.toFixed(2)} un.</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                    <button onClick={() => updateQuantity(item, -1)} className="p-1 hover:bg-white rounded"><Minus className="w-3 h-3" /></button>
                                    <span className="w-4 text-center text-xs font-semibold">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item, 1)} className="p-1 hover:bg-white rounded"><Plus className="w-3 h-3" /></button>
                                </div>
                                <button onClick={() => removeFromCart(item)} className="text-red-400 hover:text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cliente</label>
                        <CustomerAutocomplete
                            initialName={customerName}
                            onSelect={(c) => {
                                setCustomerName(c.name || '');
                                setCustomerPhone(c.phone || c.customerPhone || '');
                            }}
                            onClear={() => {
                                setCustomerName('');
                                setCustomerPhone('');
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Telefone</label>
                        <input
                            type="text"
                            placeholder="(11) 99999-9999"
                            className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none bg-gray-100 text-gray-600 cursor-not-allowed"
                            value={customerPhone}
                            readOnly
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Forma de Pagamento</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setPaymentMethod('cash')}
                            className={`flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium border transition-colors ${paymentMethod === 'cash' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                        >
                            <Banknote className="w-4 h-4" /> Dinheiro
                        </button>
                        <button
                            onClick={() => setPaymentMethod('pix')}
                            className={`flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium border transition-colors ${paymentMethod === 'pix' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                        >
                            <QrCode className="w-4 h-4" /> Pix
                        </button>
                        <button
                            onClick={() => setPaymentMethod('credit_card')}
                            className={`flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium border transition-colors ${paymentMethod === 'credit_card' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                        >
                            <CreditCard className="w-4 h-4" /> Crédito
                        </button>
                        <button
                            onClick={() => setPaymentMethod('debit_card')}
                            className={`flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium border transition-colors ${paymentMethod === 'debit_card' ? 'bg-orange-100 border-orange-500 text-orange-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                        >
                            <CreditCard className="w-4 h-4" /> Débito
                        </button>
                        <button
                            onClick={() => setPaymentMethod('fiado')}
                            className={`col-span-2 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium border transition-colors ${paymentMethod === 'fiado' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                        >
                            🛑 Fiado / Pendente
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Desconto (R$)</label>
                    <input
                        type="number"
                        placeholder="0,00"
                        className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1 pt-2">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Subtotal</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between items-center text-sm text-red-500">
                            <span>Desconto</span>
                            <span>- R$ {parseFloat(discount).toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total Final</span>
                        <span>R$ {total.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    disabled={cart.length === 0}
                    onClick={handleFinish}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                    Finalizar Venda
                </button>
            </div>
        </div>
    );
}
