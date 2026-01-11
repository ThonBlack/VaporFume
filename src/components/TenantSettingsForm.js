'use client';

import { useState, useTransition } from 'react';
import { updateTenant, uploadTenantLogo } from '@/app/actions/tenant';
import { Save, Loader2, Upload, Palette, MessageSquare, Store } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TenantSettingsForm({ tenant }) {
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: tenant?.name || '',
        logo: tenant?.logo || '',
        favicon: tenant?.favicon || '',
        primaryColor: tenant?.primaryColor || '#000000',
        secondaryColor: tenant?.secondaryColor || '#3b82f6',
        backgroundColor: tenant?.backgroundColor || '#ffffff',
        msgRecovery: tenant?.msgRecovery || 'Olá {{nome}}! 👋\n\nVimos que você deixou alguns itens no carrinho. Não perca a chance de garantir o seu pedido!\n\nFinalize agora: {{link}}',
        msgWinback15: tenant?.msgWinback15 || 'Olá {{nome}}! 👋\n\nJá fazem 15 dias do seu pedido. O que achou de {{produto}}?\n\nConta pra gente! 😊',
        msgWinback30: tenant?.msgWinback30 || 'Oi {{nome}}! 🌬️\n\nO estoque de {{produto}} deve estar acabando hein?\n\nQue tal garantir a reposição? Chegaram novidades no site!',
        msgWinback45: tenant?.msgWinback45 || 'Olá {{nome}}! 😢\n\nFaz um tempo que não te vemos por aqui...\n\nSeparamos ofertas especiais pra você!',
        msgRestock: tenant?.msgRestock || '🎉 Boa notícia {{nome}}!\n\nO produto {{produto}} que você pediu voltou ao estoque!\n\nCorre lá garantir o seu antes que acabe de novo! 🏃‍♂️',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const data = new FormData();
            data.append('file', file);
            const logoPath = await uploadTenantLogo(data);
            if (logoPath) {
                setFormData({ ...formData, logo: logoPath });
                toast.success('Logo enviado!');
            }
        } catch (error) {
            toast.error('Erro ao enviar logo');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        startTransition(async () => {
            try {
                await updateTenant(tenant.id, formData);
                toast.success('Configurações salvas!');
            } catch (error) {
                console.error(error);
                toast.error('Erro ao salvar');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Branding */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Store className="w-5 h-5 text-blue-500" /> Identidade da Loja
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                        <div className="flex items-center gap-4">
                            {formData.logo && (
                                <img src={formData.logo} alt="Logo" className="w-16 h-16 object-contain rounded border" />
                            )}
                            <label className={`cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center gap-2 ${isUploading ? 'opacity-50' : ''}`}>
                                <Upload size={16} />
                                {isUploading ? 'Enviando...' : 'Enviar Logo'}
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploading} />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Colors */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-500" /> Cores do Tema
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cor Principal</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                name="primaryColor"
                                value={formData.primaryColor}
                                onChange={handleChange}
                                className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={formData.primaryColor}
                                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                className="flex-1 p-2 border border-gray-300 rounded font-mono text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cor de Destaque</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                name="secondaryColor"
                                value={formData.secondaryColor}
                                onChange={handleChange}
                                className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={formData.secondaryColor}
                                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                className="flex-1 p-2 border border-gray-300 rounded font-mono text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cor de Fundo</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                name="backgroundColor"
                                value={formData.backgroundColor}
                                onChange={handleChange}
                                className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={formData.backgroundColor}
                                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                                className="flex-1 p-2 border border-gray-300 rounded font-mono text-sm"
                            />
                        </div>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                    Essas cores serão aplicadas em botões, links e elementos de destaque da loja.
                </p>
            </div>

            {/* Message Templates */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-500" /> Templates de Mensagens WhatsApp
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                    Variáveis disponíveis: <code className="bg-gray-100 px-1 rounded">{'{{nome}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{produto}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{valor}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{link}}'}</code>
                </p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Carrinho Abandonado</label>
                        <textarea
                            name="msgRecovery"
                            value={formData.msgRecovery}
                            onChange={handleChange}
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Winback 15 dias</label>
                            <textarea
                                name="msgWinback15"
                                value={formData.msgWinback15}
                                onChange={handleChange}
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Winback 30 dias</label>
                            <textarea
                                name="msgWinback30"
                                value={formData.msgWinback30}
                                onChange={handleChange}
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Winback 45 dias</label>
                            <textarea
                                name="msgWinback45"
                                value={formData.msgWinback45}
                                onChange={handleChange}
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Produto Voltou ao Estoque</label>
                        <textarea
                            name="msgRestock"
                            value={formData.msgRestock}
                            onChange={handleChange}
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end pt-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-black transition-all disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Salvar Alterações
                </button>
            </div>
        </form>
    );
}
