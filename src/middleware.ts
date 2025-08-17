import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Log API requests for debugging
    if (pathname.startsWith('/api/')) {
      console.log('🌐 API REQUEST:', {
        method: req.method,
        url: req.url,
        pathname: req.nextUrl.pathname,
        timestamp: new Date().toISOString(),
        userAgent: req.headers.get('user-agent')?.substring(0, 100),
      });
    }

    // Allow access to auth pages only
    if (
      pathname.startsWith('/auth') ||
      pathname.startsWith('/restaurant/auth') ||
      pathname.startsWith('/delivery/auth') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/operations')
    ) {
      return NextResponse.next();
    }

    // Allow API routes - they handle their own authentication
    if (pathname.startsWith('/api/')) {
      return NextResponse.next();
    }

    // Redirect unauthenticated users to sign in
    if (!token) {
      if (pathname.startsWith('/restaurant')) {
        return NextResponse.redirect(new URL('/restaurant/auth/signin', req.url));
      } else if (pathname.startsWith('/delivery')) {
        return NextResponse.redirect(new URL('/delivery/auth/signin', req.url));
      } else {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|offline.html|icons|public).*)',
  ],
};
