'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { getPendingOrdersCount } from '@/app/actions/orders';

export default function OrdersNavLink({ active, onClick }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const c = await getPendingOrdersCount();
                setCount(c);
            } catch (e) {
                console.error('Erro ao buscar contagem:', e);
            }
        };

        fetchCount();
        // Atualiza a cada 30 segundos
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Link
            href="/admin/orders"
            onClick={onClick}
            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative
                ${active
                    ? 'bg-[var(--primary)] text-black font-semibold shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
        >
            <ShoppingCart size={20} />
            <span>Pedidos</span>
            {count > 0 && (
                <span className="absolute right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {count}
                </span>
            )}
        </Link>
    );
}
