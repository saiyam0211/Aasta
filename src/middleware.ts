import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Allow access to auth pages
    if (pathname.startsWith("/auth") || pathname.startsWith("/restaurant/auth") || pathname.startsWith("/delivery/auth")) {
      return NextResponse.next();
    }

    // Redirect to signin if not authenticated
    if (!token) {
      // Redirect to appropriate signin page based on path
      if (pathname.startsWith("/restaurant")) {
        return NextResponse.redirect(new URL("/restaurant/auth/signin", req.url));
      } else if (pathname.startsWith("/delivery")) {
        return NextResponse.redirect(new URL("/delivery/auth/signin", req.url));
      } else {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
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
        
        // Always allow auth pages and home page
        if (pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/restaurant/auth") || pathname.startsWith("/delivery/auth")) {
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
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 