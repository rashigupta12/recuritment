'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard'); // correct spelling
    } else {
      router.push('/login');
    }
  }, [user, router]);

  return <div>Redirecting...</div>;
};

export default Home;
