'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ROLE_ROUTES } from '@/lib/constants/roles';

const HomePage = () => {
  const { user, currentRole, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current || loading) {
      return;
    }

    hasRedirected.current = true;

    if (user?.requiresPasswordReset) {
      console.log('Redirecting to password reset');
      router.replace('/first-time-password-reset');
      return;
    }

    if (isAuthenticated && currentRole && ROLE_ROUTES[currentRole]) {
      console.log('Redirecting to dashboard:', ROLE_ROUTES[currentRole]);
      router.replace(ROLE_ROUTES[currentRole]);
      return;
    }

    console.log('Redirecting to login');
    router.replace('/login');
  }, [user, currentRole, isAuthenticated, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {loading ? 'Loading...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
};

export default HomePage;