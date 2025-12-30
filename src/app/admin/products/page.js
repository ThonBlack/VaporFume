import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getProducts, deleteProduct } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function AdminProducts() {
    const products = await getProducts();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111' }}>Produtos</h1>
                <Link href="/admin/products/new">
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={20} />
                        Novo Produto
                    </button>
                </Link>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                {/* Table Wrapper for horizontal scroll */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #eee', color: '#888', fontSize: '0.9rem' }}>
                                <th style={{ padding: '16px' }}>Produto</th>
                                <th style={{ padding: '16px' }}>Categoria</th>
                                <th style={{ padding: '16px' }}>Preço</th>
                                <th style={{ padding: '16px' }}>Estoque Total</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
                                        Nenhum produto cadastrado.
                                    </td>
                                </tr>
                            ) : (
                                products.map(product => {
                                    const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
                                    return (
                                        <tr key={product.id} style={{ borderBottom: '1px solid #f5f5f7' }}>
                                            <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#f5f5f7', overflow: 'hidden' }}>
                                                    <img src={product.image || '/assets/logo-icon.png'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <Link
                                                    href={`/admin/products/${product.id}`}
                                                    style={{ fontWeight: '600', color: '#000', textDecoration: 'none' }}
                                                >
                                                    {product.name}
                                                </Link>
                                            </td>
                                            <td style={{ padding: '16px', textTransform: 'capitalize' }}>
                                                <span style={{ background: '#f5f5f7', padding: '4px 12px', borderRadius: '99px', fontSize: '0.85rem' }}>
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', fontWeight: '600' }}>R$ {product.price.toFixed(2)}</td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ color: totalStock > 0 ? 'green' : 'red' }}>
                                                    {totalStock} unid.
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <form action={async () => {
                                                    'use server';
                                                    await deleteProduct(product.id);
                                                }} style={{ display: 'inline' }}>
                                                    <button type="submit" style={{ padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', cursor: 'pointer', color: '#dc2626' }}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
