import { NextResponse } from 'next/server';

export function middleware(request) {
    const path = request.nextUrl.pathname;

    // Only run on /admin routes
    if (path.startsWith('/admin')) {
        // Allow access to login page
        if (path === '/admin/login') {
            return NextResponse.next();
        }

        // Check for session cookie
        const session = request.cookies.get('admin_session');

        if (!session || session.value !== 'authenticated') {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
