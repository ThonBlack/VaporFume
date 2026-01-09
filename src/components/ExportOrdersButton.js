'use client';

import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { exportOrdersCSV } from '@/app/actions/export';

export default function ExportOrdersButton() {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const result = await exportOrdersCSV();
            if (result.success) {
                // Create blob and download
                const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = result.filename;
                link.click();
                URL.revokeObjectURL(link.href);
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Erro ao exportar pedidos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Download className="w-4 h-4" />
            )}
            Exportar CSV
        </button>
    );
}
