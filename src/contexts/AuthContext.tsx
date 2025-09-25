/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { frappeAPI } from '@/lib/api/frappeClient';
import { AllowedRole, getAllowedRoles, ROLE_ROUTES } from '@/lib/constants/roles';
import { useRouter } from 'next/navigation';
import { ReactNode, createContext, useContext, useEffect, useState, useCallback } from 'react';

interface AuthUser {
  username: string;
  full_name: string;
  email: string;
  roles: string[];
  requiresPasswordReset: boolean;
  authenticated: boolean;
  loginTime: number;
}

interface AuthContextType {
  user: AuthUser | null;
  currentRole: AllowedRole | null;
  availableRoles: AllowedRole[];
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  sessionValid: boolean;
  login: (username: string, password: string) => Promise<{
    success: boolean;
    requiresPasswordReset?: boolean;
    error?: string;
  }>;
  resetPassword: (username: string, newPassword: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  switchRole: (role: AllowedRole) => void;
  logout: () => Promise<void>;
  clearError: () => void;
  validateSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Session timeout (24 hours)
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

// Helper function to set secure cookies
function setCookie(name: string, value: string, days: number = 1) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

function clearAllAuthData(username?: string) {
  localStorage.removeItem('frappe_user');
  deleteCookie('frappe_user');
  
  if (username) {
    localStorage.removeItem(`currentRole_${username}`);
    deleteCookie(`currentRole_${username}`);
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currentRole, setCurrentRole] = useState<AllowedRole | null>(null);
  const [availableRoles, setAvailableRoles] = useState<AllowedRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionValid, setSessionValid] = useState(false);
  const router = useRouter();

  // Strict authentication check
  const isAuthenticated = !!(
    user && 
    user.authenticated === true && 
    user.requiresPasswordReset === false && 
    currentRole && 
    availableRoles.length > 0 &&
    sessionValid
  );

  // Session validation
  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const sessionCheck = await frappeAPI.checkSession();
      
      if (!sessionCheck.authenticated) {
        console.log('Session validation failed - not authenticated');
        setSessionValid(false);
        return false;
      }

      // Check session age
      const storedUser = localStorage.getItem('frappe_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const sessionAge = Date.now() - (userData.loginTime || 0);
        
        if (sessionAge > SESSION_TIMEOUT) {
          console.log('Session expired due to timeout');
          setSessionValid(false);
          return false;
        }
      }

      setSessionValid(true);
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      setSessionValid(false);
      return false;
    }
  }, []);

  // Periodic session validation
  useEffect(() => {
    if (user && !user.requiresPasswordReset) {
      const interval = setInterval(() => {
        validateSession().then(valid => {
          if (!valid) {
            logout();
          }
        });
      }, 5 * 60 * 1000); // Check every 5 minutes

      return () => clearInterval(interval);
    }
  }, [user, validateSession]);

  // Persist current role and set cookie for middleware
  useEffect(() => {
    if (currentRole && user?.username && user.authenticated) {
      localStorage.setItem(`currentRole_${user.username}`, currentRole);
      setCookie(`currentRole_${user.username}`, currentRole);
    }
  }, [currentRole, user?.username, user?.authenticated]);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First validate session
      const isValid = await validateSession();
      if (!isValid) {
        console.log('Session validation failed during auth check');
        clearAllAuthData();
        return;
      }

      const sessionCheck = await frappeAPI.checkSession();
      
      if (sessionCheck.authenticated) {
        const username = sessionCheck.user?.username || '';
        const userData = sessionCheck.user;
        const frappeRoles = sessionCheck.details?.roles || [];
        
        console.log('Session check - user data:', userData);
        console.log('Session check - frappe roles:', frappeRoles);
        
        // Check if password reset is required
        const firstLoginCheck = await frappeAPI.checkFirstLogin(username);
        
        if (firstLoginCheck.requiresPasswordReset) {
          console.log('Password reset required for user:', username);
          
          const passwordResetUser: AuthUser = {
            username,
            full_name: userData?.full_name || username,
            email: userData?.email || username,
            roles: [],
            requiresPasswordReset: true,
            authenticated: false,
            loginTime: Date.now()
          };
          
          setUser(passwordResetUser);
          setCookie('frappe_user', JSON.stringify(passwordResetUser));
          setSessionValid(false);
          return;
        }

        // Get allowed roles
        const allowedRoles = getAllowedRoles(frappeRoles);
        console.log('Allowed roles after mapping:', allowedRoles);
        
        if (allowedRoles.length === 0) {
          console.error('No valid roles found for user:', username);
          await logout();
          setError('No valid roles assigned to your account. Please contact your administrator.');
          return;
        }

        setAvailableRoles(allowedRoles);

        // Set current role
        const savedRole = localStorage.getItem(`currentRole_${username}`);
        const initialRole = (savedRole && allowedRoles.includes(savedRole as AllowedRole)) 
          ? (savedRole as AllowedRole) 
          : allowedRoles[0];
        
        setCurrentRole(initialRole);

        const finalUser: AuthUser = {
          username,
          full_name: userData?.full_name || username,
          email: userData?.email || username,
          roles: frappeRoles.map((r: any) => typeof r === 'string' ? r : (r.role || r.name || '')),
          requiresPasswordReset: false,
          authenticated: true,
          loginTime: Date.now()
        };

        setUser(finalUser);
        
        // Set cookies for middleware
        setCookie('frappe_user', JSON.stringify(finalUser));
        setCookie(`currentRole_${username}`, initialRole);
        
        console.log('Authentication successful:', { finalUser, initialRole, allowedRoles });
      } else {
        console.log('Session check failed - not authenticated');
        clearAllAuthData();
        setSessionValid(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAllAuthData();
      setUser(null);
      setCurrentRole(null);
      setAvailableRoles([]);
      setSessionValid(false);
    } finally {
      setLoading(false);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting login process for:', username);
      
      // Clear any existing auth data
      clearAllAuthData();
      
      const response = await frappeAPI.login(username, password);
      console.log('Login response:', response);
      
      if (response.success) {
        // Check if first login
        const firstLoginCheck = await frappeAPI.checkFirstLogin(username);
        console.log('First login check:', firstLoginCheck);
        
        if (firstLoginCheck.requiresPasswordReset) {
          const passwordResetUser: AuthUser = {
            username,
            full_name: response.user?.full_name || username,
            email: response.user?.email || username,
            roles: [],
            requiresPasswordReset: true,
            authenticated: false,
            loginTime: Date.now()
          };
          
          setUser(passwordResetUser);
          setCookie('frappe_user', JSON.stringify(passwordResetUser));
          setSessionValid(false);
          
          return { success: true, requiresPasswordReset: true };
        }

        // Process roles
        const rawRoles = response.details?.roles || [];
        console.log('Raw roles from login:', rawRoles);
        
        const allowedRoles = getAllowedRoles(rawRoles);
        console.log('Allowed roles after login:', allowedRoles);
        
        if (allowedRoles.length === 0) {
          await frappeAPI.logout();
          return { 
            success: false, 
            error: 'No valid roles assigned to your account. Please contact your administrator.' 
          };
        }

        setAvailableRoles(allowedRoles);
        
        const initialRole = allowedRoles[0];
        setCurrentRole(initialRole);
        
        const finalUser: AuthUser = {
          username,
          full_name: response.user?.full_name || username,
          email: response.user?.email || username,
          roles: rawRoles.map((r: any) => typeof r === 'string' ? r : (r.role || r.name || '')),
          requiresPasswordReset: false,
          authenticated: true,
          loginTime: Date.now()
        };

        setUser(finalUser);
        setSessionValid(true);
        
        // Set cookies for middleware
        setCookie('frappe_user', JSON.stringify(finalUser));
        setCookie(`currentRole_${username}`, initialRole);
        
        console.log('Login successful, redirecting to:', ROLE_ROUTES[initialRole]);
        
        // Force redirect immediately
        setTimeout(() => {
          router.push(ROLE_ROUTES[initialRole]);
        }, 100);

        return { success: true };
      }
      
      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      clearAllAuthData();
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (username: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Starting password reset for:', username);
      const result = await frappeAPI.resetFirstTimePassword(username, newPassword);
      
      if (result.success) {
        console.log('Password reset successful');
        
        // Clear all auth data and force re-login
        clearAllAuthData(username);
        setUser(null);
        setCurrentRole(null);
        setAvailableRoles([]);
        setSessionValid(false);
        
        // Redirect to login page for fresh authentication
        setTimeout(() => {
          router.push('/login?message=Password updated successfully. Please log in again.');
        }, 100);

        return { success: true };
      }
      
      return { success: false, error: result.error || 'Password reset failed' };
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (role: AllowedRole) => {
    if (availableRoles.includes(role) && user?.authenticated) {
      setCurrentRole(role);
      if (user) {
        localStorage.setItem(`currentRole_${user.username}`, role);
        setCookie(`currentRole_${user.username}`, role);
      }
      
      // Navigate to new role dashboard
      router.push(ROLE_ROUTES[role]);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Call API logout
      await frappeAPI.logout();
      
      // Clear all auth data
      clearAllAuthData(user?.username);
      
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if API call fails
      clearAllAuthData(user?.username);
    } finally {
      // Reset all state
      setUser(null);
      setCurrentRole(null);
      setAvailableRoles([]);
      setError(null);
      setSessionValid(false);
      setLoading(false);
      
      // Always redirect to login
      router.push('/login');
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    currentRole,
    availableRoles,
    isAuthenticated,
    loading,
    error,
    sessionValid,
    login,
    resetPassword,
    switchRole,
    logout,
    clearError,
    validateSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}