import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

export const SESSION_COOKIE_NAME = 'user-session-token';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  // Allow requests for static files, API routes, and the login page
  // This is the new way of matching paths in middleware
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.endsWith('/favicon.ico') ||
    pathname === '/login' ||
    pathname.startsWith('/admin') // Admin has its own security
  ) {
    return NextResponse.next();
  }
  
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  // If no session, redirect to login
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // TODO: Here you could add logic to verify the session token against a database
  // For now, having the cookie is enough to be "logged in"

  return NextResponse.next();
}

// The 'config' object for the matcher is deprecated.
// The path matching logic is now handled inside the middleware function itself.
