'use client';

import { useState } from 'react';
import { Truck, Loader2, Printer } from 'lucide-react';
import { sendToZapEntregas } from '@/app/actions/delivery';
import toast from 'react-hot-toast';

export default function SendDeliveryButton({ orderId, printUrl }) {
    const [loading, setLoading] = useState(false);

    const handleSendAndPrint = async () => {
        setLoading(true);
        try {
            // 1. Send to Zap Entregas
            const result = await sendToZapEntregas(orderId);

            if (!result.success) {
                toast.error(result.error || 'Erro ao enviar para Zap Entregas');
                setLoading(false);
                return;
            }

            toast.success(`Entrega #${result.deliveryId} criada!`);

            // 2. Open print window
            if (printUrl) {
                window.open(printUrl, '_blank');
            }

        } catch (error) {
            console.error('SendDelivery Error:', error);
            toast.error('Erro inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSendAndPrint}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <>
                    <Truck className="w-4 h-4" />
                    <Printer className="w-4 h-4" />
                </>
            )}
            Enviar e Imprimir
        </button>
    );
}
