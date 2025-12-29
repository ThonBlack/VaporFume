'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@vaporfume.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function login(prevState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Set cookie manually
        const cookieStore = await cookies();
        cookieStore.set('admin_session', 'authenticated', {
            httpOnly: true,
            secure: false, // process.env.NODE_ENV === 'production', // FIXME: Re-enable when SSL is set up
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });
        return { success: true };
    }

    return { success: false, error: 'Credenciais inválidas' };
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    redirect('/admin/login');
}
