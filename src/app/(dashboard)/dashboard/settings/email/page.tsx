'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Mail, Lock, CheckCircle, AlertCircle, Eye, EyeOff, RefreshCw, Check } from 'lucide-react';
import { showToast } from '@/lib/toast/showToast';
import { frappeAPI } from '@/lib/api/frappeClient';

export default function EmailSettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasExistingCredentials, setHasExistingCredentials] = useState(false);
  const [existingEmail, setExistingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Initialize email with user.email and fetch existing credentials
  useEffect(() => {
    if (user?.username) {
      // Pre-fill email with user's email from AuthContext
      setEmail(user.email || '');
      fetchExistingCredentials();
    } else {
      setFetching(false);
    }
  }, [user]);

  const fetchExistingCredentials = async () => {
    try {
      setFetching(true);
      const response = await frappeAPI.makeAuthenticatedRequest(
        'GET',
        `/resource/User Setting/${user?.username}`
      );
      console.log('API Response:', response);
      if (response.data) {
        const data = response.data;
        console.log('Email data:', data);
        if (data.custom_email_configured === 1 && data.name) {
          setHasExistingCredentials(true);
          setExistingEmail(data.name);
          setEmail(data.name); // Override user.email with SMTP email if configured
        }
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
      setError('Failed to fetch existing credentials. Please try again.');
    } finally {
      setFetching(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);

    if (!email) {
      setEmailError('Email address is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password && !hasExistingCredentials) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password && password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      isValid = false;
    }

    return isValid;
  };

  const handleTestConnection = async () => {
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setTesting(true);

    try {
      const response = await fetch('/api/user/save-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          username: user?.username,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Connection test successful! Your credentials are valid.');
        showToast.success('SMTP connection verified successfully!');
      } else {
        setError(data.error || 'Connection test failed');
        showToast.error(data.error || 'Failed to verify SMTP credentials');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      showToast.error('Network error occurred');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmSave = async () => {
    setShowConfirmDialog(false);
    setLoading(true);

    try {
      const response = await fetch('/api/user/save-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          username: user?.username,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('SMTP credentials saved successfully! Your configuration is completed.');
        setHasExistingCredentials(true);
        setExistingEmail(email);
        setPassword('');
        showToast.success('SMTP credentials saved successfully!');
      } else {
        setError(data.error || 'Failed to save credentials');
        showToast.error(data.error || 'Failed to save credentials');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      showToast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  if (fetching) {
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="ml-3 text-lg text-gray-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container ">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-900">Email Settings</h1>
        {/* <p className="text-gray-600 mt-2">Configure your personal SMTP credentials to send emails from your own account.</p> */}
      </div>

      {/* Configuration Completed Message */}
      {hasExistingCredentials && existingEmail && (
        <Alert className="mb-8 border-green-300 bg-green-50 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <AlertTitle className="text-green-800 font-semibold">Configuration Completed!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your email account is successfully configured. You are connected as{' '}
              <strong>{existingEmail}</strong>. You can update your credentials below if needed.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-8 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <div>
            <AlertTitle className="font-semibold">Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </div>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="mb-8 border-green-300 bg-green-50 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <AlertTitle className="text-green-800 font-semibold">Success</AlertTitle>
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </div>
        </Alert>
      )}

      <Card className="shadow-lg rounded-xl">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-gray-900">SMTP Configuration</CardTitle>
          <CardDescription className="text-gray-600">
            Your email address has been pre-filled with your account email. You can change it if needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Email Field */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-md">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-md font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                  }}
                  className={`pl-10 pr-4 py-2 rounded-lg border ${emailError ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-primary focus:border-primary transition-all text-md`}
                  disabled={loading || testing}
                  required
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'email-error' : undefined}
                />
                {emailError && (
                  <p id="email-error" className="text-md text-red-500 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {emailError}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500">The email address you want to send emails from.</p>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Email Password / App Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={hasExistingCredentials ? '••••••••' : 'Enter your password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  className={`pl-10 pr-10 py-2 rounded-lg border ${passwordError ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                  disabled={loading || testing}
                  required={!hasExistingCredentials}
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  disabled={loading || testing}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {passwordError && (
                  <p id="password-error" className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {passwordError}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Use an app-specific password if you have two-factor authentication enabled.
              </p>
            </div>

            </div>

            {/* SMTP Server Info */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium text-sm text-gray-900">SMTP Server Configuration</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <span className="text-gray-600 font-medium">Server:</span>
                  <span className="ml-2 font-mono text-gray-900">
                    {process.env.NEXT_PUBLIC_SMTP_SERVER || 'crystal.herosite.pro'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 font-medium">Port:</span>
                  <span className="ml-2 font-mono text-gray-900">465 (SSL)</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 text-md">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={loading || testing || !email || !password}
                className="flex-1 rounded-lg border-gray-300 hover:bg-gray-100 transition-all"
              >
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Test Connection
                  </>
                )}
              </Button>
              <Button
                type="submit"
                disabled={loading || testing || !email || !password}
                className="flex-1 rounded-lg bg-primary hover:bg-primary-dark transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Credentials
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-sm text-blue-900 mb-2">💡 Need Help?</h4>
            <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
              <li>Use an app-specific password for Gmail, Outlook, or other providers with 2FA enabled.</li>
              <li>Your password is encrypted and securely stored to protect your privacy.</li>
              <li>Test your connection before saving to verify your credentials are correct.</li>
              <li>If no credentials are set, emails will be sent from the default company account.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Confirm Save Credentials</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to save these SMTP credentials for{' '}
              <strong>{email}</strong>? This will update your email configuration.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSave}
              className="rounded-lg bg-primary hover:bg-primary-dark"
            >
              <Check className="mr-2 h-4 w-4" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}