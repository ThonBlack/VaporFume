'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteOrder } from '@/app/actions/orders';
import toast from 'react-hot-toast';

export default function DeleteOrderButton({ orderId }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation();

        if (!confirm('Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.')) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteOrder(orderId);
            toast.success('Pedido excluído com sucesso!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao excluir pedido.');
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir Pedido"
        >
            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
        </button>
    );
}
