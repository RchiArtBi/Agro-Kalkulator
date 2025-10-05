import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

export const SESSION_COOKIE_NAME = 'user-session-token';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  const {pathname} = request.nextUrl;

  // Allow requests for static files, API routes, and the login page
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/login' ||
    pathname.startsWith('/admin') // Admin has its own security
  ) {
    return NextResponse.next();
  }

  // If no session, redirect to login
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // TODO: Here you could add logic to verify the session token against a database
  // For now, having the cookie is enough to be "logged in"

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  // We will handle exclusions inside the middleware itself.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
