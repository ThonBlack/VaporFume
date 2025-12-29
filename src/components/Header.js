import Link from 'next/link';
import { ShoppingBag, User } from 'lucide-react';

export default function Header() {
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
                        }}>0</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
