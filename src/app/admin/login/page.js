'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        // Mock login delay
        setTimeout(() => {
            router.push('/admin');
        }, 1000);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#050505',
            color: '#fff'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '40px',
                background: '#111',
                borderRadius: '24px',
                border: '1px solid #222',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'rgba(204, 255, 0, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px auto',
                    color: 'var(--primary)'
                }}>
                    <Lock size={24} />
                </div>

                <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Painel Administrativo</h1>
                <p style={{ color: '#666', marginBottom: '32px' }}>Entre com suas credenciais de acesso</p>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input
                        type="email"
                        placeholder="admin@vaporfume.com"
                        style={{
                            padding: '16px',
                            background: '#222',
                            border: '1px solid #333',
                            borderRadius: '12px',
                            color: '#fff',
                            outline: 'none'
                        }}
                    />
                    <input
                        type="password"
                        placeholder="••••••••"
                        style={{
                            padding: '16px',
                            background: '#222',
                            border: '1px solid #333',
                            borderRadius: '12px',
                            color: '#fff',
                            outline: 'none'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            marginTop: '8px',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Entrando...' : 'Acessar Painel'}
                    </button>
                </form>
            </div>
        </div>
    );
}
