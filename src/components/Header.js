import Link from 'next/link';
import { ShoppingBag, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const updateCount = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartCount(cart.length);
        };

        // Initial load
        updateCount();

        // Listen for events
        window.addEventListener('cart-updated', updateCount);
        return () => window.removeEventListener('cart-updated', updateCount);
    }, []);

    return (
        <header style={{
            background: 'var(--header-bg)',
            height: 'var(--header-height)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderBottom: '1px solid #222'
        }}>
            <div className="container" style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Logo Area */}
                <Link href="/">
                    <img
                        src="/assets/logo-main.png"
                        alt="Vapor Fumê"
                        style={{ height: '85px', objectFit: 'contain' }}
                    />
                </Link>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <Link href="/account" style={{ textDecoration: 'none' }}>
                        <button style={{
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            fontSize: '0.7rem'
                        }}>
                            <User size={24} />
                            <span>Conta</span>
                        </button>
                    </Link>

                    <Link href="/cart" style={{ textDecoration: 'none' }}>
                        <button style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            fontSize: '0.7rem',
                            position: 'relative'
                        }}>
                            <ShoppingBag size={24} />
                            <span>Cesta</span>
                            {cartCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-5px',
                                    right: '5px',
                                    background: 'red',
                                    color: 'white',
                                    fontSize: '10px',
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>{cartCount}</span>
                            )}
                        </button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
