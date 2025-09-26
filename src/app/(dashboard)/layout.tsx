/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { AllowedRole, ROLE_DISPLAY_NAMES } from '@/lib/constants/roles';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Home,
  LogOut,
  Menu,
  Target,
  TrendingUp,
  User,
  Users,
  X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

// Define navigation item type
type NavigationItem = {
  icon: React.ComponentType<any>;
  label: string;
  href: string;
  badge?: string;
  active?: boolean;
};

// Define navigation items based on roles
const getNavigationItems = (role: AllowedRole): NavigationItem[] => {
  const roleBasePath = `/dashboard/${role.toLowerCase().replace(/\s+/g, '-')}`;
  
  const roleSpecificItems: { [key in AllowedRole]: NavigationItem[] } = {
    'Sales User': [
      { icon: Home, label: 'Dashboard', href: roleBasePath },
      { icon: Target, label: 'Leads', href: `${roleBasePath}/leads` },
    ],
    'Sales Manager': [
      { icon: Home, label: 'Dashboard', href: roleBasePath },
      { icon: Target, label: 'Leads', href: `${roleBasePath}/leads` },
      { icon: Users, label: 'Onboarded', href: `${roleBasePath}/contract` },
      { icon: TrendingUp, label: 'Requirements', href: `${roleBasePath}/requirements` },
      { icon: FolderOpen, label: 'Todos', href: `${roleBasePath}/todos` },

    ],
    'Projects Manager': [
      { icon: Home, label: 'Dashboard', href: roleBasePath },
      { icon: FolderOpen, label: 'Projects', href: `${roleBasePath}/projects` },
    ],
    'Projects User': [
      { icon: Home, label: 'Dashboard', href: roleBasePath },
      { icon: FolderOpen, label: 'My Projects', href: `${roleBasePath}/my-projects` },
    ],
    'Delivery Manager': [
      { icon: Home, label: 'Dashboard', href: roleBasePath },
      { icon: FolderOpen, label: 'Deliveries', href: `${roleBasePath}/deliveries` },
    ],
  };

  return roleSpecificItems[role];
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, currentRole, availableRoles, switchRole, logout, isAuthenticated } = useAuth();
  const { brandConfig } = useTheme();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auto-collapse on mobile, remember desktop state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    // Load collapsed state from localStorage
    const savedCollapsedState = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsedState) {
      setSidebarCollapsed(JSON.parse(savedCollapsedState));
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  if (!isAuthenticated || !user || !currentRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--brand-background)] to-[var(--brand-muted)]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-[var(--brand-muted-foreground)]">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const navigationItems = getNavigationItems(currentRole);

  const handleRoleSwitch = (role: AllowedRole) => {
    switchRole(role);
    window.location.href = `/dashboard/${role.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const handleLogout = async () => {
    await logout();
  };

  // Improved active state logic
  const isNavItemActive = (href: string): boolean => {
    if (href.endsWith(`/dashboard/${currentRole.toLowerCase().replace(/\s+/g, '-')}`)) {
      return pathname === href;
    }
    return pathname === href || (pathname.startsWith(href + '/') && href !== '/dashboard');
  };

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-64';
  const contentMargin = sidebarCollapsed ? 'ml-16' : 'ml-64';

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 ${sidebarWidth} bg-white border-r border-gray-200 transition-all duration-300 ease-in-out`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/dashboard" className={`flex items-center space-x-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: brandConfig.colors.primary }}
              >
                <Image
                  src={brandConfig.logo}
                  alt={brandConfig.name}
                  width={20}
                  height={20}
                  className="object-contain filter brightness-0 invert"
                />
              </div>
              {!sidebarCollapsed && (
                <span className="text-xl font-bold text-gray-900 truncate">
                  {brandConfig.name}
                </span>
              )}
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* User Info */}
          <div className={`p-4 border-b border-gray-200 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback 
                  className="text-white font-semibold"
                  style={{ backgroundColor: brandConfig.colors.primary }}
                >
                  {user.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.full_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                  <div className="mt-2">
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${brandConfig.colors.primary}15`,
                        color: brandConfig.colors.primary,
                        border: `1px solid ${brandConfig.colors.primary}30`
                      }}
                    >
                      {ROLE_DISPLAY_NAMES[currentRole]}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item, index) => {
              const isActive = isNavItemActive(item.href);
              const NavItem = (
                <Link
                  key={index}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-white shadow-sm transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:scale-102'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  style={isActive ? { backgroundColor: brandConfig.colors.primary } : {}}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                  } ${sidebarCollapsed ? '' : 'mr-3'}`} />
                  
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <Badge 
                          variant="destructive" 
                          className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs flex-shrink-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              );

              // Wrap with tooltip when collapsed
              if (sidebarCollapsed) {
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      {NavItem}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      <p>{item.label}</p>
                      {item.badge && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return NavItem;
            })}
          </nav>

          {/* Role Switcher - Bottom of sidebar */}
          {availableRoles.length > 1 && (
            <div className={`p-4 border-t border-gray-200 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {sidebarCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" className="w-full h-10 p-0">
                          <User className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="ml-2">
                        <p>Switch Role</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button variant="outline" className="w-full justify-between">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span className="text-sm">Switch Role</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Available Roles
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
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Active
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Mobile Sidebar */}
        <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Mobile Sidebar Content (same as desktop but without collapse functionality) */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: brandConfig.colors.primary }}
              >
                <Image
                  src={brandConfig.logo}
                  alt={brandConfig.name}
                  width={20}
                  height={20}
                  className="object-contain filter brightness-0 invert"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">
                {brandConfig.name}
              </span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback 
                  className="text-white font-semibold"
                  style={{ backgroundColor: brandConfig.colors.primary }}
                >
                  {user.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Badge 
                variant="secondary" 
                className="text-xs"
                style={{ 
                  backgroundColor: `${brandConfig.colors.primary}15`,
                  color: brandConfig.colors.primary,
                  border: `1px solid ${brandConfig.colors.primary}30`
                }}
              >
                {ROLE_DISPLAY_NAMES[currentRole]}
              </Badge>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigationItems.map((item, index) => {
              const isActive = isNavItemActive(item.href);
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  style={isActive ? { backgroundColor: brandConfig.colors.primary } : {}}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {availableRoles.length > 1 && (
            <div className="p-4 border-t border-gray-200">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span className="text-sm">Switch Role</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Available Roles
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
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Active
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${window.innerWidth >= 1024 ? contentMargin : ''}`}>
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>

                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Dashboard
                  </h1>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback 
                          className="text-white font-semibold"
                          style={{ backgroundColor: brandConfig.colors.primary }}
                        >
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
                      <Badge 
                        variant="secondary" 
                        className="w-fit text-xs mt-1"
                        style={{ 
                          backgroundColor: `${brandConfig.colors.primary}15`,
                          color: brandConfig.colors.primary 
                        }}
                      >
                        {ROLE_DISPLAY_NAMES[currentRole]}
                      </Badge>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}