'use client';

import { useState } from 'react';
import { toggleCouponStatus, deleteCoupon } from '@/app/actions/coupons';
import { Trash2, Power, Edit, Tag } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function CouponsList({ coupons }) {
    const router = useRouter();
    const [loading, setLoading] = useState(null);

    const handleToggle = async (id) => {
        setLoading(id);
        await toggleCouponStatus(id);
        router.refresh();
        setLoading(null);
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este cupom?')) return;
        setLoading(id);
        await deleteCoupon(id);
        toast.success('Cupom excluído');
        router.refresh();
        setLoading(null);
    };

    if (coupons.length === 0) {
        return (
            <div className="text-center py-20 text-gray-400">
                <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum cupom cadastrado.</p>
                <Link href="/admin/coupons/new" className="text-purple-600 hover:underline mt-2 inline-block">
                    Criar primeiro cupom
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {coupons.map((coupon) => (
                <div
                    key={coupon.id}
                    className={`bg-white rounded-xl border p-4 flex justify-between items-center transition-all ${coupon.active ? 'border-gray-200' : 'border-gray-100 opacity-60'
                        }`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${coupon.type === 'percent' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                            <span className="font-bold text-lg">
                                {coupon.type === 'percent' ? `${coupon.value}%` : `R$${coupon.value}`}
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 text-lg">{coupon.code}</span>
                                {!coupon.active && (
                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Inativo</span>
                                )}
                            </div>
                            <div className="text-sm text-gray-500 flex gap-3">
                                {coupon.minOrderValue > 0 && (
                                    <span>Mín: R${coupon.minOrderValue.toFixed(2)}</span>
                                )}
                                {coupon.maxUses && (
                                    <span>Usos: {coupon.usedCount || 0}/{coupon.maxUses}</span>
                                )}
                                {coupon.expiresAt && (
                                    <span>Expira: {new Date(coupon.expiresAt).toLocaleDateString('pt-BR')}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleToggle(coupon.id)}
                            disabled={loading === coupon.id}
                            className={`p-2 rounded-lg transition-colors ${coupon.active
                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                            title={coupon.active ? 'Desativar' : 'Ativar'}
                        >
                            <Power className="w-4 h-4" />
                        </button>
                        <Link
                            href={`/admin/coupons/${coupon.id}`}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Editar"
                        >
                            <Edit className="w-4 h-4" />
                        </Link>
                        <button
                            onClick={() => handleDelete(coupon.id)}
                            disabled={loading === coupon.id}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Excluir"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
