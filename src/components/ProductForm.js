'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Plus, Search, Box } from 'lucide-react';

// Mock database of existing flavors across the system (could be fetched from DB too)
const GLOBAL_FLAVORS = [
    'Grape Ice', 'Strawberry Kiwi', 'Mint', 'Watermelon Ice',
    'Mango', 'Blueberry Ice', 'Banana Ice', 'Peach', 'Sakura Grape',
    'Triple Berry', 'Lemon Mint', 'Cranberry Grape'
];

export default function ProductForm({ action, initialData = null, availableProducts = [], categories = [] }) {
    // If we have initialData, parse variants from it if they came as DB objects, 
    // or use them directly. The action expects JSON string for variants.
    const [variants, setVariants] = useState(initialData?.variants || [
        { name: 'Grape Ice', stock: 50 },
        { name: 'Mint', stock: 15 }
    ]);
    const [isKit, setIsKit] = useState(!!initialData?.linkedProductId); // Initialize based on data
    const [flavorSearch, setFlavorSearch] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const filteredFlavors = GLOBAL_FLAVORS.filter(f =>
        f.toLowerCase().includes(flavorSearch.toLowerCase()) &&
        !variants.find(v => v.name === f)
    );

    const addVariant = (flavorName) => {
        setVariants([...variants, { name: flavorName, stock: 10 }]);
        setFlavorSearch('');
        setIsDropdownOpen(false);
    };

    const removeVariant = (flavorName) => {
        setVariants(variants.filter(v => v.name !== flavorName));
    };

    const updateStock = (flavorName, newStock) => {
        setVariants(variants.map(v =>
            v.name === flavorName ? { ...v, stock: parseInt(newStock) || 0 } : v
        ));
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }}>
            <div style={{ marginBottom: '24px' }}>
                <Link href="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', marginBottom: '16px' }}>
                    <ArrowLeft size={20} /> Voltar para Produtos
                </Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    {initialData ? 'Editar Produto' : 'Novo Produto'}
                </h1>
            </div>

            <form action={action} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
                {/* Hidden input to pass variants JSON */}
                <input type="hidden" name="variants" value={JSON.stringify(variants)} />
                {initialData && <input type="hidden" name="id" value={initialData.id} />}

                {/* Main Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Basic Info */}
                    <div className="card">
                        <h3 className="section-title">Informações Básicas</h3>
                        <div style={{ marginBottom: '20px' }}>
                            <label className="label">Nome do Produto</label>
                            <input
                                name="name"
                                type="text"
                                placeholder="Ex: Ignite V50"
                                className="admin-input"
                                defaultValue={initialData?.name}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                step="0.01"
                                placeholder="0.00"
                                className="admin-input"
                                defaultValue={initialData?.costPrice}
                                    />
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label className="label">Categoria</label>
                            <select
                                name="categoryId"
                                className="admin-input"
                                defaultValue={initialData?.categoryId}
                                required
                            >
                                <option value="">Selecione...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Product Type Toggle */}
                        <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label className="label" style={{ marginBottom: '12px' }}>Tipo de Produto</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="productType"
                                        checked={!isKit}
                                        onChange={() => setIsKit(false)}
                                    />
                                    <span className="font-medium">Produto Simples</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="productType"
                                        checked={isKit}
                                        onChange={() => setIsKit(true)}
                                    />
                                    <span className="font-medium">Kit / Combo</span>
                                </label>
                            </div>

                            {isKit && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                                    <div>
                                        <label className="label text-sm">Produto Base (Estoque Compartilhado)</label>
                                        <select
                                            name="linkedProductId"
                                            className="admin-input"
                                            defaultValue={initialData?.linkedProductId || ''}
                                            required={isKit}
                                        >
                                            <option value="">Selecione...</option>
                                            {availableProducts
                                                .filter(p => p.id !== initialData?.id) // Prevent self-selection
                                                .map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label text-sm">Quantidade no Kit</label>
                                        <input
                                            name="bundleSize"
                                            type="number"
                                            min="1"
                                            defaultValue={initialData?.bundleSize || 3}
                                            className="admin-input"
                                            required={isKit}
                                        />
                                    </div>
                                    <p className="col-span-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                        ℹ️ O estoque será descontado automaticamente do produto base selecionado.
                                        O cliente poderá escolher sabores baseados no estoque atual do produto base.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="label">Descrição <span style={{ color: '#888', fontWeight: 400 }}>(Opcional)</span></label>
                            <textarea
                                name="description"
                                rows={4}
                                placeholder="Detalhes sobre o produto, puffs, teor de nicotina..."
                                className="admin-input"
                                style={{ resize: 'vertical' }}
                                defaultValue={initialData?.description}
                            />
                        </div>
                    </div>

                    {/* Stock & Variants */}
                    {!isKit && (
                        <div className="card" style={{ overflow: 'visible' }}>
                            <h3 className="section-title">Estoque e Variações</h3>
                            <p style={{ color: '#666', marginBottom: '16px', fontSize: '0.9rem' }}>
                                Gerencie os sabores disponíveis e suas respectivas quantidades.
                            </p>

                            {/* Search/Add Flavor */}
                            <div style={{ position: 'relative', marginBottom: '24px' }} ref={dropdownRef}>
                                <label className="label">Adicionar Sabor</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                                        <input
                                            type="text"
                                            placeholder="Buscar ou criar novo sabor..."
                                            value={flavorSearch}
                                            onChange={(e) => {
                                                setFlavorSearch(e.target.value);
                                                setIsDropdownOpen(true);
                                            }}
                                            onFocus={() => setIsDropdownOpen(true)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (flavorSearch) addVariant(flavorSearch); } }}
                                            className="admin-input"
                                            style={{ paddingLeft: '40px' }}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => flavorSearch && addVariant(flavorSearch)}
                                        className="btn-primary"
                                        style={{ width: 'auto', padding: '0 20px' }}
                                    >
                                        Criar
                                    </button>
                                </div>

                                {/* Dropdown */}
                                {isDropdownOpen && flavorSearch && (
                                    <div style={{
                                        position: 'absolute', top: '100%', left: 0, right: 0,
                                        background: '#fff', border: '1px solid #eee', borderRadius: '8px',
                                        marginTop: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 100,
                                        maxHeight: '200px', overflowY: 'auto'
                                    }}>
                                        {filteredFlavors.length > 0 ? (
                                            filteredFlavors.map(flavor => (
                                                <button
                                                    type="button"
                                                    key={flavor}
                                                    onClick={() => addVariant(flavor)}
                                                    style={{
                                                        width: '100%', textAlign: 'left', padding: '12px 16px',
                                                        background: 'none', border: 'none', borderBottom: '1px solid #f5f5f7',
                                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                                                    }}
                                                    className="dropdown-item"
                                                >
                                                    <Plus size={14} color="var(--primary-dim)" />
                                                    {flavor}
                                                </button>
                                            ))
                                        ) : (
                                            <div style={{ padding: '12px 16px', color: '#888', fontStyle: 'italic' }}>
                                                Nenhum sabor encontrado. Clique em "Criar".
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Variants List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {variants.map((v, index) => (
                                    <div key={index} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '12px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {/* Variant Image Upload */}
                                            <div
                                                className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0 cursor-pointer overflow-hidden relative border border-gray-300 hover:border-blue-500"
                                                onClick={() => document.getElementById(`varImg_${index}`).click()}
                                                title="Adicionar foto para este sabor"
                                            >
                                                <img
                                                    id={`varPreview_${index}`}
                                                    src={v.image || undefined}
                                                    className={`w-full h-full object-cover ${!v.image && 'hidden'}`}
                                                />
                                                <div id={`varPh_${index}`} className={`absolute inset-0 flex items-center justify-center ${v.image && 'hidden'}`}>
                                                    <Upload size={14} className="text-gray-500" />
                                                </div>
                                                <input
                                                    id={`varImg_${index}`}
                                                    type="file"
                                                    name={`variant_image_${v.name}`}
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onload = (ev) => {
                                                                document.getElementById(`varPreview_${index}`).src = ev.target.result;
                                                                document.getElementById(`varPreview_${index}`).classList.remove('hidden');
                                                                document.getElementById(`varPh_${index}`).classList.add('hidden');
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '50%', background: '#e5e5e5',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.8rem', fontWeight: 'bold', color: '#555'
                                            }}>
                                                {v.name.charAt(0)}
                                            </div>
                                            <span style={{ fontWeight: '600' }}>{v.name}</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Box size={16} color="#666" />
                                                <input
                                                    type="number"
                                                    value={v.stock}
                                                    onChange={(e) => updateStock(v.name, e.target.value)}
                                                    style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center' }}
                                                />
                                                <span style={{ fontSize: '0.85rem', color: '#666' }}>unid.</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeVariant(v.name)}
                                                style={{
                                                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    border: '1px solid #fee2e2', background: '#fff', color: '#dc2626', borderRadius: '6px', cursor: 'pointer'
                                                }}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar / Image */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Multiple Images Grid */}
                    <div className="card">
                        <label className="label">Imagens do Produto <span className="text-sm font-normal text-gray-400 ml-2">(Max 5 - Ideal 1080x1080)</span></label>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[0, 1, 2, 3, 4].map((index) => {
                                const imgPath = variants.find(v => v.tempImageId === `img_${index}`)?.preview ||
                                    (initialData?.images ? JSON.parse(initialData.images)[index] : (index === 0 ? initialData?.image : null));

                                return (
                                    <div
                                        key={index}
                                        className={`relative rounded-xl border-2 ${index === 0 ? 'border-blue-100 bg-blue-50/30' : 'border-dashed border-gray-200 bg-gray-50/50'} h-40 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:border-blue-400 transition-colors group`}
                                        onClick={() => document.getElementById(`imageInput_${index}`).click()}
                                    >
                                        <input
                                            id={`imageInput_${index}`}
                                            type="file"
                                            name={`image_${index}`}
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (ev) => {
                                                        const el = document.getElementById(`preview_${index}`);
                                                        if (el) { el.src = ev.target.result; el.style.display = 'block'; }
                                                        const ph = document.getElementById(`placeholder_${index}`);
                                                        if (ph) { ph.style.display = 'none'; }

                                                        // Update visualization state if needed or leave to DOM for performance
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />

                                        <img
                                            id={`preview_${index}`}
                                            src={imgPath || undefined}
                                            className={`w-full h-full object-cover ${!imgPath && 'hidden'}`}
                                        />

                                        <div id={`placeholder_${index}`} className={`flex flex-col items-center text-gray-400 ${imgPath && 'hidden'}`}>
                                            {index === 0 ? <Upload size={24} className="mb-2 text-blue-400" /> : <Plus size={24} className="mb-2" />}
                                            <span className="text-xs font-semibold">{index === 0 ? 'Capa' : 'Adicionar'}</span>
                                        </div>

                                        {/* Remove Button (Client logic improvement later) */}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1rem' }}>
                        {initialData ? 'Salvar Alterações' : 'Criar Produto'}
                    </button>
                </div>
            </form>

            <style jsx>{`
        .card { background: #fff; padding: 24px; border-radius: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .section-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; }
        .label { display: block; margin-bottom: 8px; font-weight: 600; color: #333; }
        .admin-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.2s; }
        .admin-input:focus { border-color: var(--primary-dim); }
        .dropdown-item:hover { background-color: #f9f9f9 !important; }
      `}</style>
        </div>
    );
}
