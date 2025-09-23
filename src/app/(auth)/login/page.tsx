'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Shield, Users, Zap, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { login, error, clearError, isAuthenticated, currentRole } = useAuth();
  const { brandConfig } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (isAuthenticated && currentRole) {
      console.log('User already authenticated, redirecting to dashboard');
      const roleRoutes: Record<string, string> = {
        'Sales User': '/dashboard/sales-user',
        'Sales Manager': '/dashboard/sales-manager',
        'Projects Manager': '/dashboard/projects-manager',
        'Projects User': '/dashboard/projects-user',
        'Delivery Manager': '/dashboard/delivery-manager',
      };
      
      const redirectTo = roleRoutes[currentRole] || '/dashboard/sales-user';
      router.replace(redirectTo);
    }
  }, [isAuthenticated, currentRole, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    clearError();

    try {
      console.log('Attempting login...');
      const result = await login(username, password);
      
      console.log('Login result:', result);
      
      if (result.success) {
        if (result.requiresPasswordReset) {
          console.log('Password reset required, redirecting...');
          router.replace('/first-time-password-reset');
        } else {
          console.log('Login successful, waiting for role-based redirect...');
          // The AuthContext will handle the redirect, but add a backup
          setTimeout(() => {
            console.log('Backup redirect triggered');
            router.replace('/dashboard');
          }, 1000);
        }
      } else {
        console.error('Login failed:', result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show login form if user is already authenticated
  if (isAuthenticated && currentRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--brand-background)] via-[var(--brand-muted)] to-[var(--brand-background)]">
        <div className="text-center">
          <div className="relative">
            <div className="loading-spinner mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-ping opacity-20">
              <div className="loading-spinner mx-auto"></div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-[var(--brand-foreground)] mb-2">
            Welcome back!
          </h3>
          <p className="text-[var(--brand-muted-foreground)]">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${brandConfig.colors.primary} 0%, ${brandConfig.colors.secondary} 50%, ${brandConfig.colors.accent} 100%)`
          }}
        >
          {/* Animated geometric shapes */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-32 w-24 h-24 bg-white rounded-lg rotate-45 animate-bounce"></div>
            <div className="absolute bottom-32 left-32 w-20 h-20 bg-white rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 right-20 w-28 h-28 bg-white rounded-lg rotate-12 animate-bounce delay-500"></div>
          </div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="max-w-md">
            {/* Logo */}
            <div className="mb-8">
              <div className="flex items-center space-x-3">
                <div className="relative w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Image
                    src={brandConfig.logo}
                    alt={brandConfig.name}
                    width={40}
                    height={40}
                    className="object-contain filter brightness-0 invert"
                    priority
                  />
                </div>
                <h1 className="text-3xl font-bold ">{brandConfig.name}</h1>
              </div>
            </div>

            {/* Main heading */}
            <h2 className="text-4xl font-bold mb-6 leading-tight">
  INTELLIGENT TALENT
  <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
    FOR YOUR GROWTH
  </span>
</h2>

<p className="text-lg text-white/90 mb-8 leading-relaxed">
  At HEVHIRE, we blend AI-driven automation with human expertise to deliver 
  faster, smarter, and globally scalable hiring solutions — ensuring every 
  match is both technically precise and culturally aligned.
</p>

{/* Features list */}
<div className="space-y-4">
  <div className="flex items-center space-x-3">
    <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
      <CheckCircle className="w-4 h-4" />
    </div>
    <span className="text-white/90">AI-powered candidate screening</span>
  </div>
  <div className="flex items-center space-x-3">
    <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
      <Users className="w-4 h-4" />
    </div>
    <span className="text-white/90">Precise cultural & technical fit</span>
  </div>
  <div className="flex items-center space-x-3">
    <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
      <Zap className="w-4 h-4" />
    </div>
    <span className="text-white/90">Dedicated global support</span>
  </div>
</div>

          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-gradient-to-br from-[var(--brand-background)] via-gray-50 to-[var(--brand-muted)]">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-16 bg-[var(--brand-primary)] rounded-2xl flex items-center justify-center shadow-lg">
                <Image
                  src={brandConfig.logo}
                  alt={brandConfig.name}
                  width={40}
                  height={40}
                  className="object-contain filter brightness-0 invert"
                  priority
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[var(--brand-foreground)]">
              Welcome to {brandConfig.name}
            </h2>
            <p className="mt-2 text-[var(--brand-muted-foreground)]">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-8">
              <div className="hidden lg:block text-center">
                <div className="flex justify-center mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: brandConfig.colors.primary }}
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center text-[var(--brand-foreground)]">
                Sign In
              </CardTitle>
              <CardDescription className="text-center text-[var(--brand-muted-foreground)] text-base">
                Access your professional dashboard
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-8">
              {error && (
                <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label 
                    htmlFor="username" 
                    className="text-[var(--brand-foreground)] font-medium text-sm"
                  >
                    Username or Email
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your credentials"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 border-gray-200 focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/20 rounded-lg text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label 
                    htmlFor="password" 
                    className="text-[var(--brand-foreground)] font-medium text-sm"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 pr-12 border-gray-200 focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/20 rounded-lg text-base"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[var(--brand-primary)] transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !username || !password}
                  className="w-full h-12 text-base font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: brandConfig.colors.primary,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && username && password) {
                      e.currentTarget.style.backgroundColor = brandConfig.colors.secondary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && username && password) {
                      e.currentTarget.style.backgroundColor = brandConfig.colors.primary;
                    }
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span>Signing you in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Shield className="mr-2 h-5 w-5" />
                      <span>Sign In Securely</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-4">
            <p className="text-sm text-[var(--brand-muted-foreground)]">
              Need access? Contact your system administrator
            </p>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>Trusted</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Fast</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}