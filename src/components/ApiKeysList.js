'use client';

import { useState, useTransition } from 'react';
import { createApiKey, deleteApiKey, toggleApiKeyStatus } from '@/app/actions/apikeys';
import { Plus, Trash2, Power, Copy, Eye, EyeOff, Key } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ApiKeysList({ keys }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [newKeyName, setNewKeyName] = useState('');
    const [showKey, setShowKey] = useState({});

    const handleCreate = () => {
        if (!newKeyName.trim()) {
            toast.error('Digite um nome para a chave');
            return;
        }

        startTransition(async () => {
            const result = await createApiKey(newKeyName);
            if (result.success) {
                toast.success('API Key criada!');
                setNewKeyName('');
                router.refresh();
            }
        });
    };

    const handleDelete = (id) => {
        if (!confirm('Excluir esta API Key? Integrações que usam ela vão parar de funcionar.')) return;

        startTransition(async () => {
            await deleteApiKey(id);
            toast.success('API Key excluída');
            router.refresh();
        });
    };

    const handleToggle = (id) => {
        startTransition(async () => {
            await toggleApiKeyStatus(id);
            router.refresh();
        });
    };

    const copyKey = (key) => {
        navigator.clipboard.writeText(key);
        toast.success('Chave copiada!');
    };

    return (
        <div className="space-y-4">
            {/* Create New */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex gap-3">
                <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Nome da chave (ex: ERP, Integração X)"
                    className="flex-1 p-3 border border-gray-300 rounded-lg"
                />
                <button
                    onClick={handleCreate}
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                >
                    <Plus className="w-4 h-4" />
                    Criar Chave
                </button>
            </div>

            {/* List */}
            {keys.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma API Key criada.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {keys.map((apiKey) => (
                        <div
                            key={apiKey.id}
                            className={`bg-white rounded-xl border p-4 transition-all ${apiKey.active ? 'border-gray-200' : 'border-gray-100 opacity-60'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-900">{apiKey.name}</span>
                                        {!apiKey.active && (
                                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Inativa</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <code className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                            {showKey[apiKey.id] ? apiKey.key : `${apiKey.key.substring(0, 15)}...`}
                                        </code>
                                        <button
                                            onClick={() => setShowKey({ ...showKey, [apiKey.id]: !showKey[apiKey.id] })}
                                            className="p-1 text-gray-400 hover:text-gray-600"
                                        >
                                            {showKey[apiKey.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        <button
                                            onClick={() => copyKey(apiKey.key)}
                                            className="p-1 text-gray-400 hover:text-gray-600"
                                            title="Copiar"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                    {apiKey.lastUsedAt && (
                                        <p className="text-xs text-gray-400 mt-2">
                                            Último uso: {new Date(apiKey.lastUsedAt).toLocaleString('pt-BR')}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggle(apiKey.id)}
                                        disabled={isPending}
                                        className={`p-2 rounded-lg transition-colors ${apiKey.active
                                                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                            }`}
                                        title={apiKey.active ? 'Desativar' : 'Ativar'}
                                    >
                                        <Power className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(apiKey.id)}
                                        disabled={isPending}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
