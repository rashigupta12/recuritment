/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { frappeAPI } from '@/lib/api/frappeClient';
import { AllowedRole, getAllowedRoles, ROLE_ROUTES } from '@/lib/constants/roles';
import { showToast } from '@/lib/toast/showToast';
import { useRouter } from 'next/navigation';
import { ReactNode, createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';


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

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

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
  // Clear localStorage
  localStorage.removeItem('frappe_user');
  
  // Clear cookies
  deleteCookie('frappe_user');
  
  if (username) {
    localStorage.removeItem(`currentRole_${username}`);
    deleteCookie(`currentRole_${username}`);
  }
}

// Optimized: Set both cookie and localStorage in parallel
function setAuthData(userData: AuthUser, role?: AllowedRole) {
  const userJson = JSON.stringify(userData);
  
  // Set both in parallel
  Promise.all([
    Promise.resolve(localStorage.setItem('frappe_user', userJson)),
    Promise.resolve(setCookie('frappe_user', userJson))
  ]);
  
  if (role && userData.username) {
    Promise.all([
      Promise.resolve(localStorage.setItem(`currentRole_${userData.username}`, role)),
      Promise.resolve(setCookie(`currentRole_${userData.username}`, role))
    ]);
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
  
  // Use refs to prevent duplicate checks
  const isCheckingSession = useRef(false);
  const sessionCheckTimer = useRef<NodeJS.Timeout | null>(null);
  const hasInitialized = useRef(false);

  const isAuthenticated = !!(
    user && 
    user.authenticated === true && 
    user.requiresPasswordReset === false && 
    currentRole && 
    availableRoles.length > 0 &&
    sessionValid
  );

  // Optimized session validation with caching
  const validateSession = useCallback(async (): Promise<boolean> => {
    // Prevent duplicate checks
    if (isCheckingSession.current) {
      return sessionValid;
    }

    isCheckingSession.current = true;

    try {
      // Quick local check first
      const storedUser = localStorage.getItem('frappe_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const sessionAge = Date.now() - (userData.loginTime || 0);
        
        if (sessionAge > SESSION_TIMEOUT) {
          // console.log('Session expired due to timeout');
          // showToast.error('Your session has expired. Please log in again.');
          setSessionValid(false);
          return false;
        }
      }

      // Then check with server
      const sessionCheck = await frappeAPI.checkSession();
      
      if (!sessionCheck.authenticated) {
        // console.log('Session validation failed - not authenticated');
        // showToast.error('Session expired. Please log in again.');
        setSessionValid(false);
        return false;
      }

      setSessionValid(true);
      return true;
    } catch (error) {
      // console.error('Session validation error:', error);
      // showToast.error('Failed to validate session. Please try again.');
      setSessionValid(false);
      return false;
    } finally {
      isCheckingSession.current = false;
    }
  }, [sessionValid]);

  // Optimized periodic session validation
  useEffect(() => {
    if (user && !user.requiresPasswordReset && sessionValid) {
      // Clear existing timer
      if (sessionCheckTimer.current) {
        clearInterval(sessionCheckTimer.current);
      }

      // Set new timer
      sessionCheckTimer.current = setInterval(async () => {
        const valid = await validateSession();
        if (!valid) {
          await logout();
        }
      }, SESSION_CHECK_INTERVAL);

      return () => {
        if (sessionCheckTimer.current) {
          clearInterval(sessionCheckTimer.current);
        }
      };
    }
  }, [user, sessionValid, validateSession]);

  // Optimized initial auth check
  const checkAuthStatus = useCallback(async () => {
    // Prevent duplicate initialization
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    try {
      setLoading(true);
      setError(null);
      
      // Quick local check first
      const storedUser = localStorage.getItem('frappe_user');
      const storedData = storedUser ? JSON.parse(storedUser) : null;
      
      // If local data shows password reset needed, handle immediately
      if (storedData?.requiresPasswordReset === true) {
        setUser(storedData);
        setSessionValid(false);
        setLoading(false);
        return;
      }
      
      // Validate session
      const isValid = await validateSession();
      if (!isValid) {
        console.log('Session validation failed during auth check');
        clearAllAuthData();
        setLoading(false);
        return;
      }

      const sessionCheck = await frappeAPI.checkSession();
      
      if (sessionCheck.authenticated) {
        const username = sessionCheck.user?.username || '';
        const userData = sessionCheck.user;
        const frappeRoles = sessionCheck.details?.roles || [];
        
        // Check if password reset is required
        const firstLoginCheck = await frappeAPI.checkFirstLogin(username);
        
        if (firstLoginCheck.requiresPasswordReset) {
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
          setAuthData(passwordResetUser);
          setSessionValid(false);
          setLoading(false);
          return;
        }

        // Get allowed roles
        const allowedRoles = getAllowedRoles(frappeRoles);
        
        if (allowedRoles.length === 0) {
          console.error('No valid roles found for user:', username);
          showToast.error('No valid roles assigned to your account. Please contact administrator.');
          await logout();
          setError('No valid roles assigned to your account.');
          setLoading(false);
          return;
        }

        setAvailableRoles(allowedRoles);

        // Get saved role or use first available
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

        // Set all state at once
        setUser(finalUser);
        setAuthData(finalUser, initialRole);
        
        console.log('Authentication successful:', { finalUser, initialRole, allowedRoles });
        // showToast.success(`Welcome back, ${finalUser.full_name || finalUser.username}!`);
      } else {
        console.log('Session check failed - not authenticated');
        clearAllAuthData();
        setSessionValid(false);
      }
    } catch (error) {
      // console.error('Auth check failed:', error);
      // showToast.error('Failed to check authentication status. Please try again.');
      clearAllAuthData();
      setUser(null);
      setCurrentRole(null);
      setAvailableRoles([]);
      setSessionValid(false);
    } finally {
      setLoading(false);
    }
  }, [validateSession]);

  // Check auth status on mount only
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear any existing auth data
      clearAllAuthData();
      
      const response = await frappeAPI.login(username, password);
      
      if (response.success) {
        // Check if first login
        const firstLoginCheck = await frappeAPI.checkFirstLogin(username);
        
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
          setAuthData(passwordResetUser);
          setSessionValid(false);
          
          showToast.success('Please set a new password to continue.');
          // Immediate redirect
          router.replace('/first-time-password-reset');
          
          return { success: true, requiresPasswordReset: true };
        }

        // Process roles
        const rawRoles = response.details?.roles || [];
        const allowedRoles = getAllowedRoles(rawRoles);
        
        if (allowedRoles.length === 0) {
          await frappeAPI.logout();
          showToast.error('No valid roles assigned to your account. Please contact administrator.');
          return { 
            success: false, 
            error: 'No valid roles assigned to your account.' 
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
        setAuthData(finalUser, initialRole);
        
        showToast.success(`Welcome, ${finalUser.full_name || finalUser.username}!`);
        // Immediate redirect
        router.replace(ROLE_ROUTES[initialRole]);

        return { success: true };
      }
      
      showToast.error(response.error || 'Login failed. Please check your credentials.');
      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      clearAllAuthData();
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      showToast.error(errorMessage);
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

      const result = await frappeAPI.resetFirstTimePassword(username, newPassword);
      
      if (result.success) {
        // Clear all auth data and force re-login
        clearAllAuthData(username);
        setUser(null);
        setCurrentRole(null);
        setAvailableRoles([]);
        setSessionValid(false);
        
        showToast.success('Password updated successfully. Please log in with your new password.');
        // Immediate redirect
        router.replace('/login?message=Password updated successfully. Please log in again.');

        return { success: true };
      }
      
      showToast.error(result.error || 'Password reset failed. Please try again.');
      return { success: false, error: result.error || 'Password reset failed' };
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      showToast.error(errorMessage);
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
        setAuthData(user, role);
      }
      
      showToast.success(`Switched to ${role} view`);
      // Navigate to new role dashboard
      router.replace(ROLE_ROUTES[role]);
    } else {
      showToast.error('Failed to switch role. Please try again.');
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Call API logout
      await frappeAPI.logout();
      
      // Clear all auth data
      clearAllAuthData(user?.username);
      
      showToast.success('You have been logged out successfully.');
      
    } catch (error) {
      console.error('Logout error:', error);
      showToast.error('Failed to logout properly. Please try again.');
      clearAllAuthData(user?.username);
    } finally {
      // Reset all state
      setUser(null);
      setCurrentRole(null);
      setAvailableRoles([]);
      setError(null);
      setSessionValid(false);
      setLoading(false);
      
      // Clear timers
      if (sessionCheckTimer.current) {
        clearInterval(sessionCheckTimer.current);
      }
      
      // Immediate redirect
      router.replace('/login');
    }
  };

  const clearError = () => {
    setError(null);
  };

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