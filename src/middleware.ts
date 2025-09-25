import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define allowed roles and their routes
const ROLE_ROUTES: Record<string, string> = {
  'Sales User': '/dashboard/sales-user',
  'Sales Manager': '/dashboard/sales-manager',
  'Projects Manager': '/dashboard/projects-manager',
  'Projects User': '/dashboard/projects-user',
  'Delivery Manager': '/dashboard/delivery-manager',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`[Middleware] Processing: ${pathname}`);

  // Public routes that don't need authentication
  const publicRoutes = ['/login', '/api/auth/login', '/api/health', '/api/frappe'];
  
  // Auth routes that require special handling
  const authRoutes = ['/first-time-password-reset'];
  
  // All dashboard routes - these require full authentication
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isRootRoute = pathname === '/';

  // Allow public routes and API routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    console.log(`[Middleware] Allowing public route: ${pathname}`);
    return NextResponse.next();
  }

  // Get auth cookies/session data
  const userCookie = request.cookies.get('frappe_user')?.value;
  const sessionCookie = request.cookies.get('sid')?.value; // Frappe session cookie

  console.log(`[Middleware] Auth check - userCookie: ${!!userCookie}, sessionCookie: ${!!sessionCookie}`);

  let userData = null;
  try {
    if (userCookie) {
      userData = JSON.parse(userCookie);
      console.log(`[Middleware] User data:`, {
        username: userData?.username,
        requiresPasswordReset: userData?.requiresPasswordReset,
        authenticated: userData?.authenticated
      });
    }
  } catch (error) {
    console.error('[Middleware] Error parsing user cookie:', error);
    // Clear invalid cookie
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('frappe_user');
    return response;
  }

  // SECURITY CHECK 1: No authentication data at all
  if (!userData || !sessionCookie) {
    console.log(`[Middleware] No authentication - redirecting to login`);
    
    // Clear any potentially corrupted cookies
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('frappe_user');
    if (userData?.username) {
      response.cookies.delete(`currentRole_${userData.username}`);
    }
    
    return response;
  }

  // SECURITY CHECK 2: Validate user data structure
  if (!userData.username || !userData.hasOwnProperty('requiresPasswordReset')) {
    console.log(`[Middleware] Invalid user data structure - redirecting to login`);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('frappe_user');
    return response;
  }

  console.log(`[Middleware] User authenticated: ${userData.username}`);

  // SECURITY CHECK 3: Handle first-time password reset requirement
  if (userData.requiresPasswordReset === true) {
    console.log(`[Middleware] Password reset required for: ${userData.username}`);
    
    // Only allow access to password reset page
    if (pathname !== '/first-time-password-reset') {
      console.log(`[Middleware] Redirecting to password reset from: ${pathname}`);
      return NextResponse.redirect(new URL('/first-time-password-reset', request.url));
    }
    
    // Allow access to password reset page
    return NextResponse.next();
  }

  // SECURITY CHECK 4: Ensure password has been reset (user should not have requiresPasswordReset = true)
  if (userData.requiresPasswordReset !== false) {
    console.log(`[Middleware] Invalid password reset status - redirecting to login`);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('frappe_user');
    return response;
  }

  // SECURITY CHECK 5: Redirect authenticated users away from auth pages
  if (pathname === '/login' || pathname === '/first-time-password-reset') {
    const currentRole = request.cookies.get(`currentRole_${userData.username}`)?.value;
    
    console.log(`[Middleware] Auth user accessing auth page, current role: ${currentRole}`);
    
    if (currentRole && ROLE_ROUTES[currentRole]) {
      const redirectTo = ROLE_ROUTES[currentRole];
      console.log(`[Middleware] Redirecting authenticated user to: ${redirectTo}`);
      return NextResponse.redirect(new URL(redirectTo, request.url));
    } else {
      // No valid role, force re-authentication
      console.log(`[Middleware] No valid role found, forcing re-authentication`);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('frappe_user');
      response.cookies.delete(`currentRole_${userData.username}`);
      return response;
    }
  }

  // SECURITY CHECK 6: Handle root route redirect
  if (isRootRoute) {
    const currentRole = request.cookies.get(`currentRole_${userData.username}`)?.value;
    
    console.log(`[Middleware] Root access, current role: ${currentRole}`);
    
    if (currentRole && ROLE_ROUTES[currentRole]) {
      const redirectTo = ROLE_ROUTES[currentRole];
      console.log(`[Middleware] Redirecting root to role dashboard: ${redirectTo}`);
      return NextResponse.redirect(new URL(redirectTo, request.url));
    } else {
      // No role found, redirect to login for re-authentication
      console.log(`[Middleware] No role for root access, redirecting to login`);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('frappe_user');
      response.cookies.delete(`currentRole_${userData.username}`);
      return response;
    }
  }

  // SECURITY CHECK 7: Strict dashboard access control
  if (isDashboardRoute) {
    const currentRole = request.cookies.get(`currentRole_${userData.username}`)?.value;
    
    console.log(`[Middleware] Dashboard access attempt - role: ${currentRole}, path: ${pathname}`);
    
    // Check if user has a valid role
    if (!currentRole || !ROLE_ROUTES[currentRole]) {
      console.log(`[Middleware] Invalid role for dashboard access: ${currentRole}`);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('frappe_user');
      response.cookies.delete(`currentRole_${userData.username}`);
      return response;
    }

    // Check if user is accessing the correct dashboard for their role
    const allowedDashboard = ROLE_ROUTES[currentRole];
    if (!pathname.startsWith(allowedDashboard)) {
      console.log(`[Middleware] Role mismatch - redirecting from ${pathname} to ${allowedDashboard}`);
      return NextResponse.redirect(new URL(allowedDashboard, request.url));
    }

    // Additional validation: ensure user has roles array and it's not empty
    if (!userData.roles || !Array.isArray(userData.roles) || userData.roles.length === 0) {
      console.log(`[Middleware] No roles found in user data`);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('frappe_user');
      response.cookies.delete(`currentRole_${userData.username}`);
      return response;
    }

    console.log(`[Middleware] Dashboard access granted for role: ${currentRole}`);
  }

  // SECURITY CHECK 8: Block access to any other routes for authenticated users
  const allowedRoutes = [
    ...Object.values(ROLE_ROUTES),
    '/first-time-password-reset',
    '/login'
  ];

  if (!allowedRoutes.some(route => pathname.startsWith(route)) && !pathname.startsWith('/api/')) {
    console.log(`[Middleware] Unauthorized route access attempt: ${pathname}`);
    
    const currentRole = request.cookies.get(`currentRole_${userData.username}`)?.value;
    if (currentRole && ROLE_ROUTES[currentRole]) {
      return NextResponse.redirect(new URL(ROLE_ROUTES[currentRole], request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  console.log(`[Middleware] Access granted to: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files) 
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public|brands).*)',
  ],
};