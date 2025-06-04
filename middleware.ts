import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Define public paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/about',
  '/contact',
  '/events',
  '/baby-olympics',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/cities',
  '/api/cities/get-all',  // Add full path for cities API
  '/_next',
  '/favicon.ico',
  '/images',
  '/assets',
  '/public',
  '/_vercel',
  '/api/health'  // Add health check endpoint
];

// Define protected API routes that require authentication
const protectedApiRoutes = [
  '/api/user',
  '/api/events',
  '/api/bookings',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = cookies();
  const session = request.cookies.get('nibog-session')?.value;

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check if the path is a protected API route
  const isProtectedApiRoute = protectedApiRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Allow public paths and static files
  if (isPublicPath) {
    // If user is logged in and tries to access login/register, redirect to home
    if (session && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Handle protected API routes
  if (isProtectedApiRoute) {
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Handle protected pages (client-side routes)
  if (!session) {
    // Store the current URL for redirecting back after login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/cities (cities API)
     * - images/ (image files)
     * - assets/ (static assets)
     * - public/ (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/cities|images/|assets/|public/|_vercel/|api/health).*)',
  ],
}
