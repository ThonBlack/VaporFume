'use client';

import { useFormState } from 'react-dom';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { login } from '@/app/actions/auth';
import toast from 'react-hot-toast';

const initialState = {
    success: false,
    error: null
};

export default function AdminLogin() {
    const router = useRouter();
    const [state, formAction] = useFormState(login, initialState);

    useEffect(() => {
        if (state.success) {
            toast.success('Login realizado com sucesso!');
            router.push('/admin');
        } else if (state.error) {
            toast.error(state.error);
        }
    }, [state, router]);

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

                <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input
                        name="email"
                        type="email"
                        placeholder="admin@vaporfume.com"
                        required
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
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        style={{
                            padding: '16px',
                            background: '#222',
                            border: '1px solid #333',
                            borderRadius: '12px',
                            color: '#fff',
                            outline: 'none'
                        }}
                    />
                    <SubmitButton />
                </form>
            </div>
        </div>
    );
}

import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="btn btn-primary"
            style={{
                width: '100%',
                marginTop: '8px',
                opacity: pending ? 0.7 : 1,
                cursor: pending ? 'not-allowed' : 'pointer'
            }}
        >
            {pending ? 'Entrando...' : 'Acessar Painel'}
        </button>
    );
}
