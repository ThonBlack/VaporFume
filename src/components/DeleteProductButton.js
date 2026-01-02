'use client';

import { Trash2 } from 'lucide-react';
import { deleteProduct } from '@/lib/actions';
import { useState } from 'react';

export default function DeleteProductButton({ productId, productName }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirm(`TEM CERTEZA? 🚨\n\nVocê vai excluir o produto:\n"${productName}"\n\nIsso não pode ser desfeito.`)) {
            setIsDeleting(true);
            try {
                await deleteProduct(productId);
            } catch (error) {
                alert('Erro ao excluir. Veja o console.');
                console.error(error);
                setIsDeleting(false);
            }
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #fee2e2',
                background: '#fef2f2',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                color: '#dc2626',
                opacity: isDeleting ? 0.5 : 1
            }}
            title="Excluir Produto"
        >
            <Trash2 size={18} />
        </button>
    );
}
