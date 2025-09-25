import LoginPage from '@/components/comman/LoginPage';
import { Suspense } from 'react';


export default function Login() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginPage />
    </Suspense>
  );
}

function LoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="loading-spinner"></div>
    </div>
  );
}