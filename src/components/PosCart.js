'use client';

import { useState } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, QrCode, UserPlus, MapPin, X, Truck } from 'lucide-react';
import CustomerAutocomplete from './CustomerAutocomplete';
import { createCustomer } from '@/app/actions/customer';
import toast from 'react-hot-toast';

export default function PosCart({
    cart,
    updateQuantity,
    removeFromCart,
    onCheckout,
    customerName, setCustomerName,
    customerPhone, setCustomerPhone,
    customerAddress, setCustomerAddress,
    paymentMethod, setPaymentMethod,
    discount, setDiscount,
    sendToDelivery, setSendToDelivery
}) {
    const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });
    const [isCreating, setIsCreating] = useState(false);

    // Estado para modal de confirmação de endereço
    const [showAddressConfirm, setShowAddressConfirm] = useState(false);
    const [pendingCustomer, setPendingCustomer] = useState(null);

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = Math.max(0, subtotal - (parseFloat(discount) || 0));

    const handleFinish = () => {
        onCheckout();
    };

    const handleCreateCustomer = async () => {
        if (!newCustomer.name || !newCustomer.phone) {
            toast.error('Nome e telefone obrigatórios');
            return;
        }

        setIsCreating(true);
        try {
            const result = await createCustomer({
                name: newCustomer.name,
                phone: newCustomer.phone,
                address: newCustomer.address
            });

            if (result.success) {
                toast.success('Cliente criado!');
                setCustomerName(newCustomer.name);
                setCustomerPhone(newCustomer.phone);
                setCustomerAddress(newCustomer.address || '');
                setShowNewCustomerModal(false);
                setNewCustomer({ name: '', phone: '', address: '' });
            } else {
                toast.error(result.error || 'Erro ao criar cliente');
            }
        } catch (error) {
            toast.error('Erro ao criar cliente');
        }
        setIsCreating(false);
    };

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

            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-3">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Cliente</label>
                            <button
                                onClick={() => setShowNewCustomerModal(true)}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                                <UserPlus className="w-3 h-3" /> Novo
                            </button>
                        </div>
                        <CustomerAutocomplete
                            initialName={customerName}
                            onChange={(name) => setCustomerName(name)} // Captura nome digitado
                            onSelect={(c) => {
                                // Se cliente tem endereço, mostrar modal de confirmação
                                if (c.address) {
                                    setPendingCustomer(c);
                                    setShowAddressConfirm(true);
                                } else {
                                    // Cliente sem endereço, preencher normalmente
                                    setCustomerName(c.name || '');
                                    setCustomerPhone(c.phone || c.customerPhone || '');
                                    setCustomerAddress('');
                                }
                            }}
                            onClear={() => {
                                setCustomerName('');
                                setCustomerPhone('');
                                setCustomerAddress('');
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Telefone</label>
                        <input
                            type="text"
                            placeholder="(11) 99999-9999"
                            className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Endereço (Delivery)
                        </label>
                        <textarea
                            placeholder="Rua, número, bairro, cidade..."
                            className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 resize-none"
                            rows={2}
                            value={customerAddress || ''}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                        />
                    </div>

                    {customerAddress && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="sendToDelivery"
                                checked={sendToDelivery}
                                onChange={(e) => setSendToDelivery(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <label htmlFor="sendToDelivery" className="text-xs text-gray-600 flex items-center gap-1">
                                <Truck className="w-4 h-4" /> Enviar para Zap Entregas
                            </label>
                        </div>
                    )}
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
                    {sendToDelivery && customerAddress ? '🚀 Finalizar + Delivery' : 'Finalizar Venda'}
                </button>
            </div>

            {/* Modal Novo Cliente */}
            {showNewCustomerModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Novo Cliente</h3>
                            <button onClick={() => setShowNewCustomerModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                                <input
                                    type="text"
                                    placeholder="Nome do cliente"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                                <input
                                    type="text"
                                    placeholder="(34) 99999-9999"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço (opcional)</label>
                                <textarea
                                    placeholder="Rua, número, bairro..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none resize-none"
                                    rows={2}
                                    value={newCustomer.address}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowNewCustomerModal(false)}
                                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateCustomer}
                                disabled={isCreating}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {isCreating ? 'Criando...' : 'Criar Cliente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmação de Endereço */}
            {showAddressConfirm && pendingCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Confirmar Endereço</h3>
                            <button onClick={() => {
                                setShowAddressConfirm(false);
                                setPendingCustomer(null);
                            }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            Cliente <span className="font-semibold">{pendingCustomer.name}</span> já possui endereço cadastrado:
                        </p>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                            <div className="flex gap-3">
                                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-700">{pendingCustomer.address}</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">Deseja usar este endereço?</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    // Usar endereço salvo
                                    setCustomerName(pendingCustomer.name || '');
                                    setCustomerPhone(pendingCustomer.phone || pendingCustomer.customerPhone || '');
                                    setCustomerAddress(pendingCustomer.address);
                                    setShowAddressConfirm(false);
                                    setPendingCustomer(null);
                                }}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                            >
                                ✓ Usar Este
                            </button>
                            <button
                                onClick={() => {
                                    // Não usar, limpar endereço
                                    setCustomerName(pendingCustomer.name || '');
                                    setCustomerPhone(pendingCustomer.phone || pendingCustomer.customerPhone || '');
                                    setCustomerAddress('');
                                    setShowAddressConfirm(false);
                                    setPendingCustomer(null);
                                }}
                                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Novo Endereço
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
