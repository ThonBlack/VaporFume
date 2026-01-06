'use client';

import { useState, useTransition } from 'react';
import { updateSettings, uploadBannerImage } from '@/app/actions/settings';
import { Save, Lock, Truck, Phone, Loader2, Image as ImageIcon, Upload, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsForm({ initialSettings }) {
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        mercadopago_access_token: initialSettings.mercadopago_access_token || '',
        melhor_envio_token: initialSettings.melhor_envio_token || '',
        melhor_envio_sandbox: initialSettings.melhor_envio_sandbox || 'false',
        whatsapp_number: initialSettings.whatsapp_number || ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [slides, setSlides] = useState(() => {
        if (initialSettings.banners) {
            try { return JSON.parse(initialSettings.banners); } catch (e) { }
        }
        // Fallback or migration
        if (initialSettings.banner_image_url) {
            return [{
                desktop: initialSettings.banner_image_url,
                mobile: initialSettings.banner_image_mobile_url || '',
                title: initialSettings.banner_title || '',
                subtitle: initialSettings.banner_subtitle || '',
                link: initialSettings.banner_link || ''
            }];
        }
        return [{ desktop: '', mobile: '', title: '', subtitle: '', link: '' }];
    });


    const addSlide = () => {
        setSlides([...slides, { desktop: '', mobile: '', title: '', subtitle: '', link: '' }]);
    };

    const removeSlide = (index) => {
        setSlides(slides.filter((_, i) => i !== index));
    };

    const updateSlide = (index, field, value) => {
        const newSlides = [...slides];
        newSlides[index] = { ...newSlides[index], [field]: value };
        setSlides(newSlides);
    };

    const handleSlideUpload = async (index, field, file) => {
        if (!file) return;
        setIsUploading(true);
        const data = new FormData();
        data.append('file', file);
        try {
            const path = await uploadBannerImage(data);
            updateSlide(index, field, path);
            toast.success('Imagem enviada!');
        } catch (error) {
            toast.error('Erro ao enviar imagem');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        startTransition(async () => {
            try {
                // Combine slides into one JSON string for 'banners' key
                const payload = {
                    ...formData,
                    banners: JSON.stringify(slides)
                };
                await updateSettings(payload);
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
                {/* Storefront / Banner Carousel */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-purple-500" /> Carrossel de Banners
                    </h2>

                    <div className="space-y-6">
                        {/* Slides List */}
                        {slides.map((slide, index) => (
                            <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-100 relative group">
                                {/* Remove Button */}
                                <button
                                    type="button"
                                    onClick={() => removeSlide(index)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remover Slide"
                                >
                                    <Trash2 size={20} />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                    {/* Desktop Image */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Imagem Desktop</label>
                                        <div className="flex items-center gap-4">
                                            {slide.desktop && (
                                                <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden relative border border-gray-200">
                                                    <img src={slide.desktop} alt="Desktop" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <label className={`cursor-pointer bg-white px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                                                <Upload size={14} />
                                                {isUploading ? '...' : (slide.desktop ? 'Trocar' : 'Enviar')}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleSlideUpload(index, 'desktop', e.target.files[0])}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">1920x600px</p>
                                    </div>

                                    {/* Mobile Image */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Imagem Mobile</label>
                                        <div className="flex items-center gap-4">
                                            {slide.mobile && (
                                                <div className="w-10 h-16 bg-gray-200 rounded-lg overflow-hidden relative border border-gray-200">
                                                    <img src={slide.mobile} alt="Mobile" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <label className={`cursor-pointer bg-white px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                                                <Upload size={14} />
                                                {isUploading ? '...' : (slide.mobile ? 'Trocar' : 'Enviar')}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleSlideUpload(index, 'mobile', e.target.files[0])}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">800x1000px</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
                                        <input
                                            value={slide.title}
                                            onChange={(e) => updateSlide(index, 'title', e.target.value)}
                                            className="w-full p-2 bg-white border border-gray-200 rounded text-sm"
                                            placeholder="Ex: Oferta Relâmpago"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Link</label>
                                        <input
                                            value={slide.link}
                                            onChange={(e) => updateSlide(index, 'link', e.target.value)}
                                            className="w-full p-2 bg-white border border-gray-200 rounded text-sm"
                                            placeholder="/product/..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addSlide}
                            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <Plus size={20} /> Adicionar Novo Slide
                        </button>
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
