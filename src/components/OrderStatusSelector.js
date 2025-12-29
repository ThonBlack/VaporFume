'use client';

import { useState, useTransition } from 'react';
import { updateOrderStatus } from '@/app/actions/orders';
import { Check, Loader2, Package, Truck, CheckCircle2 } from 'lucide-react';

export default function OrderStatusSelector({ orderId, currentStatus }) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState(currentStatus);

    const handleStatusChange = (newStatus) => {
        setStatus(newStatus); // Optimistic update

        startTransition(async () => {
            try {
                await updateOrderStatus(orderId, newStatus);
            } catch (error) {
                console.error('Failed to update status:', error);
                // Revert could go here
            }
        });
    };

    const steps = [
        { value: 'paid', label: 'Pedido pago', icon: CheckCircle2 },
        { value: 'processing', label: 'Em preparação', icon: Package },
        { value: 'shipped', label: 'Pedido enviado', icon: Truck },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step) => {
                const isActive = status === step.value;
                const Icon = step.icon;

                return (
                    <button
                        key={step.value}
                        onClick={() => handleStatusChange(step.value)}
                        disabled={isPending}
                        className={`flex flex-col items-center justify-center p-6 rounded-lg border transition-all ${isActive
                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium">{step.label}</span>
                        <span className={`mt-3 text-xs font-semibold px-4 py-2 rounded-md transition-colors ${isActive ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-500'
                            }`}>
                            {isActive ? 'Selecionado' : 'Selecionar'}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
