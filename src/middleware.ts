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

    // Allow access to auth pages, admin routes, and operations routes (they have separate auth)
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

    // Redirect to signin if not authenticated
    if (!token) {
      // Redirect to appropriate signin page based on path
      if (pathname.startsWith('/restaurant')) {
        return NextResponse.redirect(
          new URL('/restaurant/auth/signin', req.url)
        );
      } else if (pathname.startsWith('/delivery')) {
        return NextResponse.redirect(new URL('/delivery/auth/signin', req.url));
      } else {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    // Allow access to all authenticated routes for now
    // We'll implement proper role-based access control later
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        const { pathname } = req.nextUrl;

        // Always allow auth pages, home page, admin routes, operations routes, and API routes
        if (
          pathname === '/' ||
          pathname.startsWith('/auth') ||
          pathname.startsWith('/restaurant/auth') ||
          pathname.startsWith('/delivery/auth') ||
          pathname.startsWith('/admin') ||
          pathname.startsWith('/operations') ||
          pathname.startsWith('/api/')
        ) {
          return true;
        }

        // For protected routes, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths including API routes for logging
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|offline.html|icons|public).*)',
  ],
};
