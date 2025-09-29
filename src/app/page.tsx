'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ROLE_ROUTES } from '@/lib/constants/roles';

const HomePage = () => {
  const { user, currentRole, isAuthenticated, loading, validateSession } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const handleRedirection = async () => {
      if (loading) {
        return; // Wait for auth to load
      }

      setRedirecting(true);

      try {
        // If user exists but needs password reset
        if (user && user.requiresPasswordReset) {
          console.log('Redirecting to password reset');
          router.replace('/first-time-password-reset');
          return;
        }

        // If user is fully authenticated
        if (isAuthenticated && currentRole && user) {
          // Validate session before redirecting to dashboard
          const sessionValid = await validateSession();
          
          if (sessionValid && ROLE_ROUTES[currentRole]) {
            console.log('Redirecting authenticated user to dashboard:', ROLE_ROUTES[currentRole]);
            router.replace(ROLE_ROUTES[currentRole]);
            return;
          } else {
            console.log('Session invalid, redirecting to login');
            router.replace('/login');
            return;
          }
        }

        // If no authentication or partial authentication, redirect to login
        console.log('No authentication, redirecting to login');
        router.replace('/login');
        
      } catch (error) {
        console.error('Error during home redirect:', error);
        router.replace('/login');
      }
    };

    handleRedirection();
  }, [user, currentRole, isAuthenticated, loading, router, validateSession]);

  // Show loading state while redirecting
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
//test
export default HomePage;