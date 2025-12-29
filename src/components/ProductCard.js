import { ShoppingBag, Star } from 'lucide-react';
import Link from 'next/link';

export default function ProductCard({ product }) {
    return (
        <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-panel" style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
            }}>
                {/* Badge */}
                {product.badge && (
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'var(--primary)',
                        color: '#000',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        zIndex: 10
                    }}>
                        {product.badge}
                    </div>
                )}

                {/* Image Area */}
                <div style={{
                    height: '240px',
                    width: '100%',
                    background: '#eeeeee', // Light gray placeholder
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    <img
                        src={product.image}
                        alt={product.name}
                        style={{
                            height: '100%',
                            width: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease'
                        }}
                        className="product-img"
                    />
                </div>

                {/* Content */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                            {product.category}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                            <Star size={14} fill="#fbbf24" />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{product.rating}</span>
                        </div>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {product.name}
                    </h3>

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {product.oldPrice && (
                                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    R$ {product.oldPrice.toFixed(2)}
                                </span>
                            )}
                            <span style={{ color: 'var(--primary-dim)', fontWeight: '700', fontSize: '1.25rem' }}>
                                R$ {product.price.toFixed(2)}
                            </span>
                        </div>

                        <button className="btn-primary" style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <ShoppingBag size={20} color="#000" />
                        </button>
                    </div>
                </div>

                <style jsx>{`
          .glass-panel:hover {
            transform: translateY(-5px);
            border-color: var(--primary);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .glass-panel:hover .product-img {
            transform: scale(1.1);
          }
        `}</style>
            </div>
        </Link>
    );
}
