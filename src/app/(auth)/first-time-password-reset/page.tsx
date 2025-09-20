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
import { Loader2, Eye, EyeOff, Check, X } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24">
              <Image
                src={brandConfig.logo}
                alt={brandConfig.name}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome {user.full_name}! Please set a new password for your first login.
          </p>
        </div>

        <Card className="brand-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Password</CardTitle>
            <CardDescription className="text-center">
              Your password must meet the requirements below
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="form-input pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isLoading}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="form-input pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <div className={`text-xs flex items-center gap-1 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordsMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Password Requirements:</Label>
                <div className="space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className={`text-xs flex items-center gap-2 ${req.met ? 'text-green-600' : 'text-gray-400'}`}>
                      {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {req.text}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-primary"
                disabled={isLoading || !allRequirementsMet || !passwordsMatch}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Set Password & Continue'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}