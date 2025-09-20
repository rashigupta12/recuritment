//src/contexts/authcontext.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { frappeAPI } from '@/lib/api/frappeClient';
import { AllowedRole, getAllowedRoles } from '@/lib/constants/roles';
import { useRouter } from 'next/navigation';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface AuthUser {
  username: string;
  full_name: string;
  email: string;
  roles: string[];
  requiresPasswordReset: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  currentRole: AllowedRole | null;
  availableRoles: AllowedRole[];
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currentRole, setCurrentRole] = useState<AllowedRole | null>(null);
  const [availableRoles, setAvailableRoles] = useState<AllowedRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isAuthenticated = !!user && !user.requiresPasswordReset && !!currentRole;

  // Check auth status on mount
  // useEffect(() => {
  //   checkAuthStatus();
  // }, []);

  // Persist current role
  useEffect(() => {
    if (currentRole && user?.username) {
      localStorage.setItem(`currentRole_${user.username}`, currentRole);
    }
  }, [currentRole, user?.username]);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const sessionCheck = await frappeAPI.checkSession();
      
      if (sessionCheck.authenticated) {
        const username = sessionCheck.user?.username || '';
        const userData = sessionCheck.user;
        const frappeRoles = sessionCheck.details?.roles || [];
        
        // Check if password reset is required
        if (sessionCheck.details?.requiresPasswordReset) {
          setUser({
            username,
            full_name: userData?.full_name || username,
            email: userData?.email || username,
            roles: [],
            requiresPasswordReset: true,
          });
          return;
        }

        // Get allowed roles
        const allowedRoles = getAllowedRoles(frappeRoles);
        
        if (allowedRoles.length === 0) {
          await logout();
          setError('No valid roles assigned to your account.');
          return;
        }

        setAvailableRoles(allowedRoles);

        // Set current role
        const savedRole = localStorage.getItem(`currentRole_${username}`);
        const initialRole = (savedRole && allowedRoles.includes(savedRole as AllowedRole)) 
          ? (savedRole as AllowedRole) 
          : allowedRoles[0];
        
        setCurrentRole(initialRole);

        setUser({
          username,
          full_name: userData?.full_name || username,
          email: userData?.email || username,
          roles: frappeRoles.map((r: any) => typeof r === 'string' ? r : (r.role || r.name || '')),
          requiresPasswordReset: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setCurrentRole(null);
      setAvailableRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await frappeAPI.login(username, password);
      
      if (response.success) {
        // Check if first login
        const firstLoginCheck = await frappeAPI.checkFirstLogin(username);
        
        if (firstLoginCheck.requiresPasswordReset) {
          setUser({
            username,
            full_name: response.user?.full_name || username,
            email: response.user?.email || username,
            roles: [],
            requiresPasswordReset: true,
          });
          
          return { success: true, requiresPasswordReset: true };
        }

        // Process roles
        const rawRoles = response.details?.roles || response.user?.roles || [];
        const allowedRoles = getAllowedRoles(rawRoles);
        
        if (allowedRoles.length === 0) {
          await frappeAPI.logout();
          return { success: false, error: 'No valid roles assigned to your account.' };
        }

        setAvailableRoles(allowedRoles);
        
        const initialRole = allowedRoles[0];
        setCurrentRole(initialRole);
        
        setUser({
          username,
          full_name: response.user?.full_name || username,
          email: response.user?.email || username,
          roles: rawRoles.map((r: any) => typeof r === 'string' ? r : (r.role || r.name || '')),
          requiresPasswordReset: false,
        });

        return { success: true };
      }
      
      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
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

      const result = await frappeAPI.resetFirstTimePassword(username, newPassword);
      
      if (result.success) {
        // Re-login with new password
        const loginResult = await frappeAPI.login(username, newPassword);
        
        if (loginResult.success) {
          const rawRoles = loginResult.details?.roles || loginResult.user?.roles || [];
          const allowedRoles = getAllowedRoles(rawRoles);
          
          if (allowedRoles.length === 0) {
            return { success: false, error: 'No valid roles assigned to your account.' };
          }
          
          setAvailableRoles(allowedRoles);
          const initialRole = allowedRoles[0];
          setCurrentRole(initialRole);
          
          setUser({
            username,
            full_name: loginResult.user?.full_name || username,
            email: loginResult.user?.email || username,
            roles: rawRoles.map((r: any) => typeof r === 'string' ? r : (r.role || r.name || '')),
            requiresPasswordReset: false,
          });

          return { success: true };
        }
      }
      
      return { success: false, error: result.error || 'Password reset failed' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (role: AllowedRole) => {
    if (availableRoles.includes(role)) {
      setCurrentRole(role);
      if (user) {
        localStorage.setItem(`currentRole_${user.username}`, role);
      }
    }
  };

  const logout = async () => {
    try {
      await frappeAPI.logout();
      if (user?.username) {
        localStorage.removeItem(`currentRole_${user.username}`);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setCurrentRole(null);
      setAvailableRoles([]);
      setError(null);
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
    login,
    resetPassword,
    switchRole,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}