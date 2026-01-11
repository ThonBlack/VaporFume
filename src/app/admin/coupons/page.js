import { getCoupons } from '@/app/actions/coupons';
import Link from 'next/link';
import { Plus, Ticket } from 'lucide-react';
import CouponsList from '@/components/CouponsList';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
    const coupons = await getCoupons();

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-10 flex justify-between items-end">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Ticket className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Cupons de Desconto</h1>
                        <p className="text-gray-500 text-sm">{coupons.length} cupons cadastrados</p>
                    </div>
                </div>
                <Link
                    href="/admin/coupons/new"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Novo Cupom
                </Link>
            </div>

            <CouponsList coupons={coupons} />
        </div>
    );
}
