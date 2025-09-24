/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { AllowedRole, ROLE_DISPLAY_NAMES } from '@/lib/constants/roles';
import {
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  LogOut,
  Menu,
  Search,
  Settings,
  Target,
  TrendingUp,
  User,
  Users,
  X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';

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
  const baseItems: NavigationItem[] = [
    // { icon: Home, label: 'Dashboard', href: '/dashboard', active: true },
    // { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    // { icon: Calendar, label: 'Calendar', href: '/calendar' },
    // { icon: MessageSquare, label: 'Messages', href: '/messages', badge: '3' },
  ];

  const roleSpecificItems: { [key in AllowedRole]: NavigationItem[] } = {
    'Sales User': [
      { icon: Target, label: 'Leads', href: '/dashboard/sales-user/leads' },
      // { icon: Users, label: 'Customers', href: '/customers' },
      // { icon: TrendingUp, label: 'Pipeline', href: '/pipeline' },
    ],
    'Sales Manager': [
      { icon: Target, label: 'Leads', href: '/leads' },
      { icon: Users, label: 'Team', href: '/team' },
      { icon: TrendingUp, label: 'Reports', href: '/reports' },
      { icon: Briefcase, label: 'Deals', href: '/deals' },
    ],
    'Projects Manager': [
      { icon: FolderOpen, label: 'Projects', href: '/projects' },
      { icon: Users, label: 'Team', href: '/team' },
      { icon: Calendar, label: 'Timeline', href: '/timeline' },
      { icon: BarChart3, label: 'Reports', href: '/reports' },
    ],
    'Projects User': [
      { icon: FolderOpen, label: 'My Projects', href: '/my-projects' },
      { icon: Calendar, label: 'Tasks', href: '/tasks' },
      { icon: Users, label: 'Team', href: '/team' },
    ],
    'Delivery Manager': [
      { icon: FolderOpen, label: 'Deliveries', href: '/deliveries' },
      { icon: Users, label: 'Resources', href: '/resources' },
      { icon: BarChart3, label: 'Performance', href: '/performance' },
    ],
  };

  return [...baseItems, ...roleSpecificItems[role]];
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, currentRole, availableRoles, switchRole, logout, isAuthenticated } = useAuth();
  const { brandConfig } = useTheme();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
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
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
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
          
          {/* Current Role Badge */}
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

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigationItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
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
                {isActive && (
                  <ChevronRight className="ml-auto h-4 w-4 text-white" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Role Switcher - Bottom of sidebar */}
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Breadcrumb or Page Title */}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome , {user.full_name.split(' ')[0]}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              {/* <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent text-sm focus:ring-[var(--brand-primary)]"
                  />
                </div>
              </div> */}

              {/* Notifications */}
              {/* <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </Button> */}

              {/* User Menu */}
              <DropdownMenu >
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full -top-1">
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
                  {/* <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem> */}
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
  );
}