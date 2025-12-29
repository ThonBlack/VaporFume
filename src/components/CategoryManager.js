'use client';

import { useState, useTransition } from 'react';
import { createCategory, deleteCategory } from '@/app/actions/categories';
import { Plus, Trash2, Folder, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CategoryManager({ initialCategories }) {
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState('');

    const handleCreate = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        startTransition(async () => {
            try {
                await createCategory({ name });
                setName('');
                toast.success('Categoria criada!');
            } catch (error) {
                toast.error('Erro ao criar categoria');
            }
        });
    };

    const handleDelete = (id) => {
        if (!confirm('Tem certeza? Produtos nessa categoria podem ficar sem categoria.')) return;

        startTransition(async () => {
            try {
                await deleteCategory(id);
                toast.success('Categoria removida!');
            } catch (error) {
                toast.error('Erro ao remover categoria');
            }
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Create Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                <h3 className="font-semibold text-gray-900 mb-4">Nova Categoria</h3>
                <form onSubmit={handleCreate} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Nome da categoria (ex: Pods Descartáveis)"
                        className="flex-1 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <button
                        disabled={isPending || !name}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Adicionar
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Categorias Existentes</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {initialCategories.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">Nenhuma categoria encontrada.</div>
                    ) : (
                        initialCategories.map(cat => (
                            <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Folder className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{cat.name}</p>
                                        <p className="text-xs text-gray-400">Slug: {cat.slug}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    disabled={isPending}
                                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
