'use client';

import { useState, useTransition } from 'react';
import { createCoupon, updateCoupon } from '@/app/actions/coupons';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CouponForm({ coupon = null }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState({
        code: coupon?.code || '',
        type: coupon?.type || 'percent',
        value: coupon?.value || '',
        minOrderValue: coupon?.minOrderValue || '',
        maxUses: coupon?.maxUses || '',
        expiresAt: coupon?.expiresAt?.split('T')[0] || '',
        active: coupon?.active ?? true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.code || !formData.value) {
            toast.error('Preencha código e valor');
            return;
        }

        startTransition(async () => {
            try {
                if (coupon) {
                    await updateCoupon(coupon.id, formData);
                    toast.success('Cupom atualizado!');
                } else {
                    await createCoupon(formData);
                    toast.success('Cupom criado!');
                }
                router.push('/admin/coupons');
                router.refresh();
            } catch (error) {
                console.error(error);
                toast.error('Erro ao salvar cupom');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/coupons" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                    {coupon ? 'Editar Cupom' : 'Novo Cupom'}
                </h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código do Cupom *
                        </label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="DESCONTO10"
                            className="w-full p-3 border border-gray-300 rounded-lg uppercase font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1">Será convertido para maiúsculas</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Desconto
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                        >
                            <option value="percent">Porcentagem (%)</option>
                            <option value="fixed">Valor Fixo (R$)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valor do Desconto *
                        </label>
                        <input
                            type="number"
                            name="value"
                            value={formData.value}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            placeholder={formData.type === 'percent' ? '10' : '15.00'}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.type === 'percent' ? '10 = 10% de desconto' : '15 = R$15 de desconto'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pedido Mínimo (R$)
                        </label>
                        <input
                            type="number"
                            name="minOrderValue"
                            value={formData.minOrderValue}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            placeholder="50.00"
                            className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Máximo de Usos
                        </label>
                        <input
                            type="number"
                            name="maxUses"
                            value={formData.maxUses}
                            onChange={handleChange}
                            min="1"
                            placeholder="100"
                            className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">Deixe vazio para ilimitado</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data de Expiração
                        </label>
                        <input
                            type="date"
                            name="expiresAt"
                            value={formData.expiresAt}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-7">
                        <input
                            type="checkbox"
                            id="active"
                            name="active"
                            checked={formData.active}
                            onChange={handleChange}
                            className="w-5 h-5 text-purple-600 rounded"
                        />
                        <label htmlFor="active" className="text-sm font-medium text-gray-700">
                            Cupom ativo
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {coupon ? 'Salvar Alterações' : 'Criar Cupom'}
                </button>
            </div>
        </form>
    );
}
