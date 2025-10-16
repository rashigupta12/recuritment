'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Check, X, Shield, RefreshCw, Lock, Zap } from 'lucide-react';
import Image from 'next/image';

interface PasswordRequirement {
  text: string;
  met: boolean;
}

const FirstTimePasswordResetPage = () => {
  const { user, resetPassword, logout, loading, error, clearError } = useAuth();
  const { brandConfig } = useTheme();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Security check: redirect if user doesn't need password reset
  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('No user found, redirecting to login');
        router.replace('/login');
        return;
      }
      
      if (!user.requiresPasswordReset) {
        console.log('Password reset not required, redirecting to login');
        router.replace('/login');
        return;
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clear errors when user starts typing
  useEffect(() => {
    if (error) {
      clearError();
    }
    setLocalError(null);
  }, [formData.newPassword, formData.confirmPassword, error, clearError]);

  const passwordRequirements: PasswordRequirement[] = [
    { text: '8+ chars', met: formData.newPassword.length >= 8 },
    { text: 'A-Z', met: /[A-Z]/.test(formData.newPassword) },
    { text: 'a-z', met: /[a-z]/.test(formData.newPassword) },
    { text: '0-9', met: /\d/.test(formData.newPassword) },
    { text: 'Special', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(formData.newPassword) },
  ];

  const allRequirementsMet = passwordRequirements.every(req => req.met);
  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.newPassword.length > 0;

  const validatePassword = (): boolean => {
    const { newPassword, confirmPassword } = formData;
    
    if (!newPassword) {
      setLocalError('New password is required');
      return false;
    }
    
    if (newPassword.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return false;
    }
    
    if (!/[A-Z]/.test(newPassword)) {
      setLocalError('Password must contain at least one uppercase letter');
      return false;
    }
    
    if (!/[a-z]/.test(newPassword)) {
      setLocalError('Password must contain at least one lowercase letter');
      return false;
    }
    
    if (!/\d/.test(newPassword)) {
      setLocalError('Password must contain at least one number');
      return false;
    }
    
    if (!confirmPassword) {
      setLocalError('Please confirm your password');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.username) {
      setLocalError('User session invalid. Please log in again.');
      return;
    }
    
    if (!validatePassword()) {
      return;
    }

    setIsResetting(true);
    setLocalError(null);
    
    try {
      console.log('Attempting password reset for:', user.username);
      
      const result = await resetPassword(user.username, formData.newPassword);
      
      if (!result.success) {
        setLocalError(result.error || 'Password reset failed. Please try again.');
      }
      // If successful, the AuthContext will handle redirection to login
    } catch (error) {
      console.error('Password reset submission error:', error);
      setLocalError('An unexpected error occurred. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = async () => {
    await logout();
  };

  // Show loading if auth is still checking
  if (loading) {
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
            Loading...
          </h3>
          <p className="text-[var(--brand-muted-foreground)]">
            Please wait while we check your session
          </p>
        </div>
      </div>
    );
  }

  // Security check: don't show page if user doesn't exist or doesn't need reset
  if (!user || !user.requiresPasswordReset) {
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
            Redirecting...
          </h3>
          <p className="text-[var(--brand-muted-foreground)]">
            Please wait while we redirect you
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

  const displayError = localError || error;
  const isFormValid = allRequirementsMet && passwordsMatch;

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Panel - Security & Welcome Message */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${brandConfig.colors.primary} 0%, ${brandConfig.colors.secondary} 50%, ${brandConfig.colors.accent} 100%)`
          }}
        >
          {/* Simplified geometric shapes */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
            <div className="absolute top-20 right-16 w-16 h-16 bg-white rounded-lg rotate-45"></div>
            <div className="absolute bottom-16 left-16 w-12 h-12 bg-white rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-14 h-14 bg-white rounded-lg rotate-12"></div>
          </div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-8 text-white">
          <div className="max-w-md">
            {/* Logo */}
            <div className="mb-6">
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Image
                    src={brandConfig.logo}
                    alt={brandConfig.name}
                    width={32}
                    height={32}
                    className="object-contain filter brightness-0 invert"
                    priority
                  />
                </div>
                <h1 className="text-2xl font-bold">{brandConfig.name}</h1>
              </div>
            </div>

            {/* Welcome back message */}
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              WELCOME BACK
              <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                {user.full_name}
              </span>
            </h2>

            <p className="text-md text-white/90 mb-6 leading-relaxed">
              To ensure the security of your account, please create a strong password 
              that meets our security requirements.
            </p>

            {/* Security features */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3" />
                </div>
                <span className="text-white/90 text-md">End-to-end encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Lock className="w-3 h-3" />
                </div>
                <span className="text-white/90 text-md">Secure password storage</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3" />
                </div>
                <span className="text-white/90 text-md">Instant access after setup</span>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-md font-medium">Setup Progress</span>
                <span className="text-md">Step 1 of 1</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div className="bg-white h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Password Reset Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6 bg-gradient-to-br from-[var(--brand-background)] via-gray-50 to-[var(--brand-muted)] overflow-hidden">
        <div className="w-full max-w-md space-y-4">
          {/* Mobile header */}
          <div className="lg:hidden text-center">
            <div className="flex justify-center mb-3">
              <div className="relative w-12 h-12 bg-[var(--brand-primary)] rounded-xl flex items-center justify-center shadow-lg">
                <Image
                  src={brandConfig.logo}
                  alt={brandConfig.name}
                  width={28}
                  height={28}
                  className="object-contain filter brightness-0 invert"
                  priority
                />
              </div>
            </div>
            <h2 className="text-xl font-bold text-[var(--brand-foreground)]">
              Welcome {user.full_name}!
            </h2>
            <p className="mt-1 text-md text-[var(--brand-muted-foreground)]">
              Set up your secure password to continue
            </p>
          </div>

          {/* Error Message */}
          {displayError && (
            <Alert variant="destructive" className="border-red-200 bg-red-50 py-2">
              <AlertDescription className="text-red-800 text-md">{displayError}</AlertDescription>
            </Alert>
          )}

          {/* Password Reset Card */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 ">
              <div className="hidden lg:block text-center">
                <div className="flex justify-center">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg relative"
                    style={{ backgroundColor: brandConfig.colors.primary }}
                  >
                    <RefreshCw className="w-5 h-5 text-white" />
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-1.5 h-1.5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-center text-[var(--brand-foreground)]">
                Create New Password
              </CardTitle>
            
            </CardHeader>
            
            <CardContent className="pb-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-[var(--brand-foreground)] font-medium text-md">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      required
                      disabled={isResetting}
                      className="h-10 pr-10 border-gray-200 focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/20 rounded-lg text-md"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[var(--brand-primary)] transition-colors"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isResetting}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[var(--brand-foreground)] font-medium text-md">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      disabled={isResetting}
                      className="h-10 pr-10 border-gray-200 focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/20 rounded-lg text-md"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[var(--brand-primary)] transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isResetting}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword.length > 0 && (
                    <div className={`text-md flex items-center gap-1 mt-1 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordsMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                    </div>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <Label className="text-[var(--brand-foreground)] font-medium text-md flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Security Requirements
                  </Label>
                  <div className="grid grid-cols-3 gap-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className={`text-sm flex items-center gap-1 ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
                        <div className={`w-3 h-3 rounded-full flex items-center justify-center ${req.met ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {req.met ? <Check className="w-2 h-2" /> : <X className="w-2 h-2 text-gray-400" />}
                        </div>
                        {req.text}
                      </div>
                    ))}
                  </div>
                  
                  {/* Password strength indicator */}
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-md text-gray-600">Password Strength</span>
                      <span className="text-md text-gray-600">
                        {passwordRequirements.filter(req => req.met).length}/5
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          passwordRequirements.filter(req => req.met).length < 3 ? 'bg-red-500' :
                          passwordRequirements.filter(req => req.met).length < 5 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(passwordRequirements.filter(req => req.met).length / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    type="submit"
                    disabled={isResetting || !isFormValid}
                    className="w-full h-10 text-md font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: brandConfig.colors.primary,
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      if (!isResetting && isFormValid) {
                        e.currentTarget.style.backgroundColor = brandConfig.colors.secondary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isResetting && isFormValid) {
                        e.currentTarget.style.backgroundColor = brandConfig.colors.primary;
                      }
                    }}
                  >
                    {isResetting ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        <span>Update Password</span>
                      </div>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={handleCancel}
                    disabled={isResetting}
                    variant="outline"
                    className="w-full h-10 text-md font-semibold rounded-lg transition-all duration-200"
                  >
                    Cancel & Logout
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-md text-[var(--brand-muted-foreground)]">
              This is a one-time password reset. After updating, you will need to log in again.
            </p>
  
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstTimePasswordResetPage;