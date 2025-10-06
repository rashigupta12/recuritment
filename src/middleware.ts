import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define allowed roles and their routes
const ROLE_ROUTES: Record<string, string> = {
  'Sales User': '/dashboard/sales-user',
  'Sales Manager': '/dashboard/sales-manager',
  'Projects Manager': '/dashboard/projects-manager',
  'Projects User': '/dashboard/projects-user',
  'Delivery Manager': '/dashboard/delivery-manager',
  'Recruiter': '/dashboard/recruiter'
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need authentication
  const publicRoutes = ['/login', '/api/auth/login', '/api/health', '/api/frappe'];
  
  // All dashboard routes
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isRootRoute = pathname === '/';

  // OPTIMIZATION: Quick exit for public routes and API routes
  if (publicRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Get auth cookies/session data
  const userCookie = request.cookies.get('frappe_user')?.value;
  const sessionCookie = request.cookies.get('sid')?.value;

  let userData = null;
  try {
    if (userCookie) {
      userData = JSON.parse(userCookie);
    }
  } catch (error) {
    console.error('[Middleware] Error parsing user cookie:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('frappe_user');
    return response;
  }

  // OPTIMIZATION: Single authentication check
  if (!userData || !sessionCookie || !userData.username) {
    console.log(`[Middleware] No authentication - redirecting to login`);
    
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('frappe_user');
    if (userData?.username) {
      response.cookies.delete(`currentRole_${userData.username}`);
    }
    
    return response;
  }

  // OPTIMIZATION: Handle password reset requirement early
  if (userData.requiresPasswordReset === true) {
    if (pathname !== '/first-time-password-reset') {
      return NextResponse.redirect(new URL('/first-time-password-reset', request.url));
    }
    return NextResponse.next();
  }

  // OPTIMIZATION: Ensure password has been reset
  if (userData.requiresPasswordReset !== false) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('frappe_user');
    return response;
  }

  // Get current role once
  const currentRole = request.cookies.get(`currentRole_${userData.username}`)?.value;

  // OPTIMIZATION: Redirect authenticated users away from auth pages
  if (pathname === '/login' || pathname === '/first-time-password-reset') {
    if (currentRole && ROLE_ROUTES[currentRole]) {
      return NextResponse.redirect(new URL(ROLE_ROUTES[currentRole], request.url));
    } else {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('frappe_user');
      response.cookies.delete(`currentRole_${userData.username}`);
      return response;
    }
  }

  // OPTIMIZATION: Handle root route redirect
  if (isRootRoute) {
    if (currentRole && ROLE_ROUTES[currentRole]) {
      return NextResponse.redirect(new URL(ROLE_ROUTES[currentRole], request.url));
    } else {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('frappe_user');
      response.cookies.delete(`currentRole_${userData.username}`);
      return response;
    }
  }

  // OPTIMIZATION: Strict dashboard access control (combined checks)
  if (isDashboardRoute) {
    // Validate role exists
    if (!currentRole || !ROLE_ROUTES[currentRole]) {
      console.log(`[Middleware] Invalid role for dashboard access: ${currentRole}`);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('frappe_user');
      response.cookies.delete(`currentRole_${userData.username}`);
      return response;
    }

    // Check if accessing correct dashboard
    const allowedDashboard = ROLE_ROUTES[currentRole];
    if (!pathname.startsWith(allowedDashboard)) {
      return NextResponse.redirect(new URL(allowedDashboard, request.url));
    }

    // Validate roles array exists
    if (!userData.roles || !Array.isArray(userData.roles) || userData.roles.length === 0) {
      console.log(`[Middleware] No roles found in user data`);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('frappe_user');
      response.cookies.delete(`currentRole_${userData.username}`);
      return response;
    }
  }

  // OPTIMIZATION: Allow access to any other valid routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|brands).*)',
  ],
};