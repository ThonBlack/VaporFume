import { getCouponById } from '@/app/actions/coupons';
import CouponForm from '@/components/CouponForm';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditCouponPage({ params }) {
    const { id } = await params;
    const couponId = parseInt(id);

    if (isNaN(couponId)) notFound();

    const coupon = await getCouponById(couponId);

    if (!coupon) notFound();

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <CouponForm coupon={coupon} />
        </div>
    );
}
