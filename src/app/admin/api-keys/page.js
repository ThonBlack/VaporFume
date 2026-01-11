import { getApiKeys } from '@/app/actions/apikeys';
import { Key } from 'lucide-react';
import ApiKeysList from '@/components/ApiKeysList';

export const dynamic = 'force-dynamic';

export default async function AdminApiKeysPage() {
    const keys = await getApiKeys();

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-10 flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Key className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
                    <p className="text-gray-500 text-sm">Chaves para integração com sistemas externos</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="font-semibold text-gray-900 mb-3">Como usar a API</h2>
                <div className="text-sm text-gray-600 space-y-2">
                    <p>Adicione o header <code className="bg-gray-100 px-2 py-0.5 rounded">X-API-KEY</code> em suas requisições:</p>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                        {`curl -H "X-API-KEY: vf_sk_xxx" https://seusite.com/api/v1/products`}
                    </pre>
                    <p className="mt-4"><strong>Endpoints disponíveis:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                        <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/products</code> - Lista produtos</li>
                        <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/orders</code> - Lista pedidos</li>
                    </ul>
                </div>
            </div>

            <ApiKeysList keys={keys} />
        </div>
    );
}
