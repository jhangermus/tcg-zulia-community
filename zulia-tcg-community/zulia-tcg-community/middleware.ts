import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
    const token = await getToken({ req });

    // Check if the user is authenticated
    if (!token) {
        // Redirect to login if not authenticated
        return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // Allow the request to proceed if authenticated
    return NextResponse.next();
}

// Apply middleware only to admin routes
export const config = {
    matcher: ['/admin/:path*'],
};