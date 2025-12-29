'use client';

import { useState, useTransition } from 'react';
import { updateOrderStatus } from '@/app/actions/orders';
import { Loader2 } from 'lucide-react';

export default function OrderStatusUpdate({ orderId, currentStatus }) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState(currentStatus);

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);

        startTransition(async () => {
            try {
                await updateOrderStatus(orderId, newStatus);
            } catch (error) {
                console.error('Failed to update status:', error);
                // Opcional: Reverter status em caso de erro ou mostrar toast
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
                Status:
            </label>
            <div className="relative">
                <select
                    id="status"
                    value={status}
                    onChange={handleStatusChange}
                    disabled={isPending}
                    className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm shadow-sm bg-white border"
                >
                    <option value="pending">Pendente</option>
                    <option value="processing">Processando</option>
                    <option value="shipped">Enviado</option>
                    <option value="completed">Concluído</option>
                    <option value="canceled">Cancelado</option>
                </select>
                {isPending && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                )}
            </div>
        </div>
    );
}
