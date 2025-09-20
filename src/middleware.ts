import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need authentication
  const publicRoutes = ['/login', '/api/auth/login', '/api/health'];
  
  // Auth routes that require special handling
  const authRoutes = ['/first-time-password-reset'];
  
  // Dashboard routes
  const dashboardRoutes = [
    '/dashboard/sales-user',
    '/dashboard/sales-manager', 
    '/dashboard/projects-manager',
    '/dashboard/projects-user',
    '/dashboard/delivery-manager'
  ];

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get auth cookies/session data
  const userCookie = request.cookies.get('frappe_user')?.value;
  const sessionCookie = request.cookies.get('frappe_session')?.value;

  let userData = null;
  try {
    if (userCookie) {
      userData = JSON.parse(userCookie);
    }
  } catch (error) {
    console.error('Error parsing user cookie:', error);
  }

  // Handle unauthenticated users
  if (!userData || !sessionCookie) {
    if (pathname.startsWith('/dashboard') || authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Handle first-time password reset
  if (userData.requiresPasswordReset) {
    if (pathname !== '/first-time-password-reset') {
      return NextResponse.redirect(new URL('/first-time-password-reset', request.url));
    }
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (pathname === '/login' || pathname === '/first-time-password-reset') {
    const currentRole = request.cookies.get(`currentRole_${userData.username}`)?.value;
    
    if (currentRole) {
      const roleRoutes: Record<string, string> = {
        'Sales User': '/dashboard/sales-user',
        'Sales Manager': '/dashboard/sales-manager',
        'Projects Manager': '/dashboard/projects-manager',
        'Projects User': '/dashboard/projects-user',
        'Delivery Manager': '/dashboard/delivery-manager',
      };
      
      const redirectTo = roleRoutes[currentRole] || '/dashboard/sales-user';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  // Handle dashboard root redirect
  if (pathname === '/dashboard' || pathname === '/') {
    const currentRole = request.cookies.get(`currentRole_${userData.username}`)?.value;
    
    if (currentRole) {
      const roleRoutes: Record<string, string> = {
        'Sales User': '/dashboard/sales-user',
        'Sales Manager': '/dashboard/sales-manager',
        'Projects Manager': '/dashboard/projects-manager',
        'Projects User': '/dashboard/projects-user',
        'Delivery Manager': '/dashboard/delivery-manager',
      };
      
      const redirectTo = roleRoutes[currentRole] || '/dashboard/sales-user';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|brands|api/health).*)',
  ],
};