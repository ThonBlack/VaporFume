'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { updateOrderStatus } from '@/app/actions/orders';
import { toast } from 'react-hot-toast';

export default function FinalizeOrderButton({ orderId }) {
    const [loading, setLoading] = useState(false);

    const handleFinalize = async () => {
        if (!confirm('Deseja finalizar este pedido? Isso marcará como Pago e Entregue.')) return;

        setLoading(true);
        try {
            await updateOrderStatus(orderId, 'completed');
            toast.success('Pedido finalizado!');
            // Force refresh or let the server action revalidatePath handle it (it might not refresh client state instantly without router.refresh())
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao finalizar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleFinalize}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-colors shadow-md mt-4 disabled:opacity-50"
        >
            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Finalizar (Pago e Entregue)
        </button>
    );
}
