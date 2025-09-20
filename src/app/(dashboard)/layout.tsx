'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/providers/ThemeProvider';
import { ROLE_DISPLAY_NAMES, AllowedRole } from '@/lib/constants/roles';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { LogOut, User, ChevronDown, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, currentRole, availableRoles, switchRole, logout, isAuthenticated } = useAuth();
  const { brandConfig } = useTheme();

  if (!isAuthenticated || !user || !currentRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const handleRoleSwitch = (role: AllowedRole) => {
    switchRole(role);
    window.location.href = `/dashboard/${role.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image
                src={brandConfig.logo}
                alt={brandConfig.name}
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-foreground">
              {brandConfig.name}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Role Switcher - only show if user has multiple roles */}
          {availableRoles.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <User className="h-4 w-4" />
                  {ROLE_DISPLAY_NAMES[currentRole]}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Switch Role
                </div>
                <DropdownMenuSeparator />
                {availableRoles.map((role) => (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => handleRoleSwitch(role)}
                    className={role === currentRole ? 'bg-accent' : ''}
                  >
                    {ROLE_DISPLAY_NAMES[role]}
                    {role === currentRole && (
                      <span className="ml-auto text-xs">Current</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{user.full_name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  Role: {ROLE_DISPLAY_NAMES[currentRole]}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}