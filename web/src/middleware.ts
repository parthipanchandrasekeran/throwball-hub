import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the login page itself through unauthenticated.
  if (pathname === '/admin/login') return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifyToken(token);
  if (session) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*'],
};
