import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`[Middleware] Processing: ${pathname}`);

  // Public routes that don't need authentication
  const publicRoutes = ['/login', '/api/auth/login', '/api/health', '/api/frappe'];
  
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

  // Allow public routes and API routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    console.log(`[Middleware] Allowing public route: ${pathname}`);
    return NextResponse.next();
  }

  // Get auth cookies/session data
  const userCookie = request.cookies.get('frappe_user')?.value;
  const sessionCookie = request.cookies.get('sid')?.value; // Frappe uses 'sid' for session

  console.log(`[Middleware] Auth check - userCookie: ${!!userCookie}, sessionCookie: ${!!sessionCookie}`);

  let userData = null;
  try {
    if (userCookie) {
      userData = JSON.parse(userCookie);
      console.log(`[Middleware] User data parsed:`, userData);
    }
  } catch (error) {
    console.error('[Middleware] Error parsing user cookie:', error);
  }

  // Handle unauthenticated users
  if (!userData || !sessionCookie) {
    console.log(`[Middleware] No valid auth, checking if protected route`);
    if (pathname.startsWith('/dashboard') || authRoutes.includes(pathname)) {
      console.log(`[Middleware] Redirecting to login from: ${pathname}`);
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  console.log(`[Middleware] User authenticated: ${userData.username}`);

  // Handle first-time password reset
  if (userData.requiresPasswordReset) {
    console.log(`[Middleware] Password reset required`);
    if (pathname !== '/first-time-password-reset') {
      console.log(`[Middleware] Redirecting to password reset`);
      return NextResponse.redirect(new URL('/first-time-password-reset', request.url));
    }
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (pathname === '/login' || pathname === '/first-time-password-reset') {
    const currentRole = request.cookies.get(`currentRole_${userData.username}`)?.value;
    
    console.log(`[Middleware] Auth user on login page, current role: ${currentRole}`);
    
    if (currentRole) {
      const roleRoutes: Record<string, string> = {
        'Sales User': '/dashboard/sales-user',
        'Sales Manager': '/dashboard/sales-manager',
        'Projects Manager': '/dashboard/projects-manager',
        'Projects User': '/dashboard/projects-user',
        'Delivery Manager': '/dashboard/delivery-manager',
      };
      
      const redirectTo = roleRoutes[currentRole] || '/dashboard/sales-user';
      console.log(`[Middleware] Redirecting auth user to: ${redirectTo}`);
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  // Handle dashboard root redirect
  if (pathname === '/dashboard' || pathname === '/') {
    const currentRole = request.cookies.get(`currentRole_${userData.username}`)?.value;
    
    console.log(`[Middleware] Dashboard root access, current role: ${currentRole}`);
    
    if (currentRole) {
      const roleRoutes: Record<string, string> = {
        'Sales User': '/dashboard/sales-user',
        'Sales Manager': '/dashboard/sales-manager',
        'Projects Manager': '/dashboard/projects-manager',
        'Projects User': '/dashboard/projects-user',
        'Delivery Manager': '/dashboard/delivery-manager',
      };
      
      const redirectTo = roleRoutes[currentRole] || '/dashboard/sales-user';
      console.log(`[Middleware] Redirecting to role dashboard: ${redirectTo}`);
      return NextResponse.redirect(new URL(redirectTo, request.url));
    } else {
      // No role found, redirect to login to re-establish session
      console.log(`[Middleware] No role found, redirecting to login`);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Check if user has access to specific dashboard routes
  if (dashboardRoutes.some(route => pathname.startsWith(route))) {
    const currentRole = request.cookies.get(`currentRole_${userData.username}`)?.value;
    
    if (!currentRole) {
      console.log(`[Middleware] No role for dashboard access, redirecting to login`);
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    console.log(`[Middleware] Dashboard access granted for role: ${currentRole}`);
  }

  console.log(`[Middleware] Allowing request to: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|brands|api/health).*)',
  ],
};