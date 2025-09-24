'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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

export default function PasswordResetPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user, resetPassword, error, clearError } = useAuth();
  const { brandConfig } = useTheme();
  const router = useRouter();

  const passwordRequirements: PasswordRequirement[] = [
    { text: 'At least 8 characters', met: newPassword.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(newPassword) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(newPassword) },
    { text: 'Contains number', met: /\d/.test(newPassword) },
    { text: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) },
  ];

  const allRequirementsMet = passwordRequirements.every(req => req.met);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allRequirementsMet || !passwordsMatch || !user?.username) {
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const result = await resetPassword(user.username, newPassword);
      
      if (result.success) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.requiresPasswordReset) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Security & Welcome Message */}
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
        <div className="relative z-10 flex flex-col justify- p-12 py-5 text-white">
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
                <h1 className="text-3xl font-bold">{brandConfig.name}</h1>
              </div>
            </div>

            {/* Welcome back message */}
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              WELCOME BACK
              <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                {user.full_name}
              </span>
            </h2>

            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              To ensure the security of your account, please create a strong password 
              that meets our security requirements. This helps protect your data and 
              maintain the integrity of our platform.
            </p>

            {/* Security features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-white/90">End-to-end encryption</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-white/90">Secure password storage</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-white/90">Instant access after setup</span>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Setup Progress</span>
                <span className="text-sm">Step 1 of 1</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Password Reset Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-gradient-to-br from-[var(--brand-background)] via-gray-50 to-[var(--brand-muted)]">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile header */}
          <div className="lg:hidden text-center">
            <div className="flex justify-center mb-4">
              {/* <div className="relative w-16 h-16 bg-[var(--brand-primary)] rounded-2xl flex items-center justify-center shadow-lg">
                <Image
                  src={brandConfig.logo}
                  alt={brandConfig.name}
                  width={40}
                  height={40}
                  className="object-contain filter brightness-0 invert"
                  priority
                />
              </div> */}
            </div>
            <h2 className="text-2xl font-bold text-[var(--brand-foreground)]">
              Welcome {user.full_name}!
            </h2>
            <p className="mt-2 text-[var(--brand-muted-foreground)]">
              Set up your secure password to continue
            </p>
          </div>

          {/* Password Reset Card */}
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-6">
              <div className="hidden lg:block text-center">
                <div className="flex justify-center mb-4">
                  {/* <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg relative"
                    style={{ backgroundColor: brandConfig.colors.primary }}
                  >
                    <RefreshCw className="w-6 h-6 text-white" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  </div> */}
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center text-[var(--brand-foreground)]">
                Create New Password
              </CardTitle>
              <CardDescription className="text-center text-[var(--brand-muted-foreground)] text-base">
                Set up a secure password for your first login
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
                  <Label htmlFor="newPassword" className="text-[var(--brand-foreground)] font-medium text-sm">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 pr-12 border-gray-200 focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/20 rounded-lg text-base"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[var(--brand-primary)] transition-colors"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isLoading}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-[var(--brand-foreground)] font-medium text-sm">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 pr-12 border-gray-200 focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/20 rounded-lg text-base"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[var(--brand-primary)] transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <div className={`text-sm flex items-center gap-2 mt-2 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordsMatch ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                    </div>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <Label className="text-[var(--brand-foreground)] font-medium text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security Requirements
                  </Label>
                  <div className="grid grid-cols-1 gap-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className={`text-sm flex items-center gap-2 ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-gray-400" />}
                        </div>
                        {req.text}
                      </div>
                    ))}
                  </div>
                  
                  {/* Password strength indicator */}
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Password Strength</span>
                      <span className="text-xs text-gray-600">
                        {passwordRequirements.filter(req => req.met).length}/5
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordRequirements.filter(req => req.met).length < 3 ? 'bg-red-500' :
                          passwordRequirements.filter(req => req.met).length < 5 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(passwordRequirements.filter(req => req.met).length / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !allRequirementsMet || !passwordsMatch}
                  className="w-full h-12 text-base font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: brandConfig.colors.primary,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && allRequirementsMet && passwordsMatch) {
                      e.currentTarget.style.backgroundColor = brandConfig.colors.secondary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && allRequirementsMet && passwordsMatch) {
                      e.currentTarget.style.backgroundColor = brandConfig.colors.primary;
                    }
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span>Setting up your password...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="mr-2 h-5 w-5" />
                      <span>Complete Setup & Continue</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-4">
            <p className="text-sm text-[var(--brand-muted-foreground)]">
              This is a one-time setup. Your password will be securely encrypted.
            </p>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Encrypted</span>
              </div>
              <div className="flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Fast Setup</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}