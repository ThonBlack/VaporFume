'use client';

import { useState, useTransition } from 'react';
import { updateSettings, uploadBannerImage } from '@/app/actions/settings';
import { Save, Lock, Truck, Phone, Loader2, Image as ImageIcon, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsForm({ initialSettings }) {
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        mercadopago_access_token: initialSettings.mercadopago_access_token || '',
        melhor_envio_token: initialSettings.melhor_envio_token || '',
        melhor_envio_sandbox: initialSettings.melhor_envio_sandbox || 'false',
        whatsapp_number: initialSettings.whatsapp_number || '',
        banner_image_url: initialSettings.banner_image_url || '',
        banner_title: initialSettings.banner_title || 'Bem-vindo à Vapor Fumê',
        banner_subtitle: initialSettings.banner_subtitle || 'Os melhores produtos do mercado.',
        banner_link: initialSettings.banner_link || '/product/ignite-v50'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const data = new FormData();
        data.append('file', file);

        try {
            const path = await uploadBannerImage(data);
            setFormData(prev => ({ ...prev, banner_image_url: path }));
            toast.success('Imagem enviada com sucesso!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao enviar imagem.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        startTransition(async () => {
            try {
                await updateSettings(formData);
                toast.success('Configurações salvas!');
            } catch (error) {
                console.error(error);
                toast.error('Erro ao salvar configurações.');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Storefront / Banner */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-500" /> Loja e Visual
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Principal</label>

                        {/* Preview */}
                        {formData.banner_image_url && (
                            <div className="mb-3 relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                <img src={formData.banner_image_url} alt="Banner Preview" className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <label className={`flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                <span className="text-sm font-medium">{isUploading ? 'Enviando...' : 'Escolher Imagem (Upload)'}</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                            </label>
                            <span className="text-xs text-gray-400">Recomendado: 1920x600px (PNG, JPG)</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título do Banner</label>
                            <input
                                type="text"
                                name="banner_title"
                                value={formData.banner_title}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                            <input
                                type="text"
                                name="banner_subtitle"
                                value={formData.banner_subtitle}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link do Botão (Ex: /product/nome-do-produto)</label>
                            <input
                                type="text"
                                name="banner_link"
                                value={formData.banner_link}
                                onChange={handleChange}
                                placeholder="/product/ignite-v50"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mercado Pago */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-500" /> Mercado Pago
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Access Token (Produção)</label>
                        <input
                            type="password"
                            name="mercadopago_access_token"
                            value={formData.mercadopago_access_token}
                            onChange={handleChange}
                            placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Encontre em: <a href="https://www.mercadopago.com.br/developers/panel" target="_blank" className="text-blue-600 hover:underline">Painel do Desenvolvedor</a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Melhor Envio */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-amber-500" /> Melhor Envio
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Token de Integração</label>
                        <input
                            type="password"
                            name="melhor_envio_token"
                            value={formData.melhor_envio_token}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                        />
                        <div className="flex items-center gap-2 mt-3">
                            <input
                                type="checkbox"
                                id="me_sandbox"
                                name="melhor_envio_sandbox"
                                checked={formData.melhor_envio_sandbox === 'true'}
                                onChange={(e) => setFormData({ ...formData, melhor_envio_sandbox: e.target.checked ? 'true' : 'false' })}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="me_sandbox" className="text-sm text-gray-700">Usar Ambiente de Teste (Sandbox)</label>
                        </div>
                    </div>
                </div>
            </div>

            {/* WhatsApp */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-500" /> Notificações WhatsApp
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número para Receber Pedidos</label>
                        <input
                            type="text"
                            name="whatsapp_number"
                            value={formData.whatsapp_number}
                            onChange={handleChange}
                            placeholder="5511999999999"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Inclua o código do país (55) e DDD. Ex: 5511999999999.
                        </p>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end pt-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Salvar Alterações
                </button>
            </div>

        </form>
    );
}
