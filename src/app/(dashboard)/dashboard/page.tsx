'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_ROUTES } from '@/lib/constants/roles';

export default function DashboardPage() {
  const { currentRole, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (currentRole) {
        const route = ROLE_ROUTES[currentRole];
        router.push(route);
      }
    }
  }, [currentRole, isAuthenticated, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="loading-spinner"></div>
    </div>
  );
}