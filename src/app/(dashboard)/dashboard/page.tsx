'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_ROUTES } from '@/lib/constants/roles';

export default function DashboardPage() {
  const { currentRole, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        console.log('Redirecting to /login: Not authenticated'); // Debug log
        router.push('/login');
        return;
      }

      // Redirect only if on the root dashboard and not on settings routes
      if (
        pathname === '/dashboard' &&
        currentRole &&
        !pathname.startsWith('/dashboard/settings')
      ) {
        const route = ROLE_ROUTES[currentRole];
        console.log(`Redirecting to role-specific route: ${route}`); // Debug log
        router.push(route);
      }
    }
  }, [currentRole, isAuthenticated, loading, router, pathname]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="loading-spinner"></div>
    </div>
  );
}