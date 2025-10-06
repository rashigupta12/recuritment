/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client";


import FeedbackComponent from "@/components/comman/FeedbackManagement";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { AllowedRole, ROLE_DISPLAY_NAMES } from "@/lib/constants/roles";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Target,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

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
  const roleBasePath = `/dashboard/${role.toLowerCase().replace(/\s+/g, "-")}`;

  const roleSpecificItems: { [key in AllowedRole]: NavigationItem[] } = {
    "Sales User": [
      { icon: Home, label: "Dashboard", href: roleBasePath },
      { icon: Target, label: "Leads", href: `${roleBasePath}/leads` },
    ],
    "Sales Manager": [
      { icon: Home, label: "Dashboard", href: roleBasePath },
      { icon: Target, label: "Leads", href: `${roleBasePath}/leads` },
      { icon: Users, label: "Customers", href: `${roleBasePath}/contract` },
      {
        icon: TrendingUp,
        label: "Requirements",
        href: `${roleBasePath}/requirements`,
      },
    ],
    "Projects Manager": [
      { icon: Home, label: "Dashboard", href: roleBasePath },
      { icon: FolderOpen, label: "Projects", href: `${roleBasePath}/projects` },
    ],
    "Projects User": [
      { icon: Home, label: "Dashboard", href: roleBasePath },
      // {
      //   icon: FolderOpen,
      //   label: "My Projects",
      //   href: `${roleBasePath}/my-projects`,
      // },
    ],
    "Delivery Manager": [
      { icon: Home, label: "Dashboard", href: roleBasePath },
      {
        icon: FolderOpen,
        label: "Deliveries",
        href: `${roleBasePath}/deliveries`,
      },
    ],
    Recruiter: [
      { icon: Home, label: "Dashboard", href: roleBasePath },
      {
        icon: FolderOpen,
        label: "Jobs Assigned",
        href: `${roleBasePath}/todos`,
      },
      {
        icon: Users,
        label: "Candidate Tracker",
        href: `${roleBasePath}/viewapplicant`,
      },
    ],
  };

  return roleSpecificItems[role];
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const {
    user,
    currentRole,
    availableRoles,
    switchRole,
    logout,
    isAuthenticated,
  } = useAuth();
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

    const savedCollapsedState = localStorage.getItem("sidebar-collapsed");
    if (savedCollapsedState) {
      setSidebarCollapsed(JSON.parse(savedCollapsedState));
    } else {
      setSidebarCollapsed(true);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  if (!isAuthenticated || !user || !currentRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--brand-background)] to-[var(--brand-muted)]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-[var(--brand-muted-foreground)]">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  const navigationItems = getNavigationItems(currentRole);

  const handleRoleSwitch = (role: AllowedRole) => {
    switchRole(role);
    window.location.href = `/dashboard/${role
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
  };

  const handleLogout = async () => {
    await logout();
  };

  const isNavItemActive = (href: string): boolean => {
    if (
      href.endsWith(
        `/dashboard/${currentRole.toLowerCase().replace(/\s+/g, "-")}`
      )
    ) {
      return pathname === href;
    }
    return (
      pathname === href ||
      (pathname.startsWith(href + "/") && href !== "/dashboard")
    );
  };

  const sidebarStyles = {
    width: sidebarCollapsed ? "4rem" : "14rem",
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-gray-50/50">
        {/* Desktop Sidebar */}
        <div
          className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 bg-white/95 backdrop-blur-sm border-r border-gray-200/60 shadow-sm transition-all duration-300 ease-in-out"
          style={sidebarStyles}
        >
          <div className="flex items-center justify-center h-14 px-3 border-b border-gray-200/60 flex-shrink-0">
            <Link
              href="/dashboard"
              className={`flex items-center ${
                sidebarCollapsed ? "justify-center" : "space-x-2"
              }`}
            >
              <div className="rounded-lg flex items-center justify-center flex-shrink-0">
                {!sidebarCollapsed && (
                  <Image
                    src={brandConfig.logo}
                    alt={brandConfig.name}
                    width={150}
                    height={150}
                    className=""
                  />
                )}
              </div>
            </Link>
          </div>

          <div className="relative flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="absolute -right-3 top-2 h-6 w-6 p-0 bg-white border border-gray-200 shadow-sm hover:shadow-md z-10 rounded-full"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronLeft className="h-3 w-3" />
              )}
            </Button>
          </div>

          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto min-h-0">
            {navigationItems.map((item, index) => {
              const isActive = isNavItemActive(item.href);
              const NavItem = (
                <Link
                  key={index}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-md font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                  } ${sidebarCollapsed ? "justify-center" : ""}`}
                  style={
                    isActive
                      ? {
                          backgroundColor: brandConfig.colors.primary,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }
                      : {}
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`h-4 w-4 flex-shrink-0 ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-600"
                    } ${sidebarCollapsed ? "" : "mr-3"}`}
                  />

                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 truncate text-md">
                        {item.label}
                      </span>
                      {item.badge && (
                        <Badge
                          variant="destructive"
                          className="ml-2 h-4 w-4 flex items-center justify-center p-0 text-md flex-shrink-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              );

              if (sidebarCollapsed) {
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>{NavItem}</TooltipTrigger>
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

          <div
            className={`p-3 border-t border-gray-200/60 flex-shrink-0 ${
              sidebarCollapsed ? "px-2" : "px-3"
            }`}
          >
            {sidebarCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarFallback
                        className="text-white font-semibold text-md"
                        style={{ backgroundColor: brandConfig.colors.primary }}
                      >
                        {user.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <p className="font-medium text-md">{user.full_name}</p>
                  <p className="text-md text-gray-500">{user.email}</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {ROLE_DISPLAY_NAMES[currentRole]}
                  </Badge>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback
                    className="text-white font-semibold text-md"
                    style={{ backgroundColor: brandConfig.colors.primary }}
                  >
                    {user.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium text-gray-900 truncate">
                    {user.full_name}
                  </p>
                  <Badge
                    variant="secondary"
                    className="text-ms mt-0.5"
                    style={{
                      backgroundColor: `${brandConfig.colors.primary}15`,
                      color: brandConfig.colors.primary,
                      border: `1px solid ${brandConfig.colors.primary}30`,
                    }}
                  >
                    {ROLE_DISPLAY_NAMES[currentRole]}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {availableRoles.length > 1 && (
            <div
              className={`p-2 border-t border-gray-200/60 flex-shrink-0 ${
                sidebarCollapsed ? "px-2" : "px-3"
              }`}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {sidebarCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-8 p-0"
                          size="sm"
                        >
                          <User className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="ml-2">
                        <p>Switch Role</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full justify-between h-8 text-xs"
                      size="sm"
                    >
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-2" />
                        <span>Switch Role</span>
                      </div>
                      <ChevronDown className="h-3 w-3" />
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
                      className={role === currentRole ? "bg-accent" : ""}
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

       <div
          className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
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

            <div className="p-6 border-b border-gray-200 flex-shrink-0">
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
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <div className="mt-3">
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: `${brandConfig.colors.primary}15`,
                    color: brandConfig.colors.primary,
                    border: `1px solid ${brandConfig.colors.primary}30`,
                  }}
                >
                  {ROLE_DISPLAY_NAMES[currentRole]}
                </Badge>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto min-h-0">
              {navigationItems.map((item, index) => {
                const isActive = isNavItemActive(item.href);
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? "text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: brandConfig.colors.primary }
                        : {}
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
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
              <div className="p-4 border-t border-gray-200 flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
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
                        className={role === currentRole ? "bg-accent" : ""}
                      >
                        {ROLE_DISPLAY_NAMES[role]}
                        {role === currentRole && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-xs"
                          >
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
        </div>


        {/* Main Content */}
        <div
          className="flex-1 flex flex-col min-h-screen lg:ml-16 transition-all duration-300 ease-in-out"
          style={{
            marginLeft:
              typeof window !== "undefined" && window.innerWidth >= 1024
                ? sidebarCollapsed
                  ? "4rem"
                  : "14rem"
                : "0",
          }}
        >
          {/* Header */}
          <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/60 px-4 py-2.5 shadow-sm flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden h-8 w-8 p-0"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>

                <div className="flex items-center space-x-3">
                  {sidebarCollapsed && (
                    <div className="hidden lg:flex items-center space-x-2">
                      <Image
                        src={brandConfig.logo}
                        alt={brandConfig.name}
                        width={150}
                        height={150}
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full p-0"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback
                          className="text-white font-semibold text-sm"
                          style={{
                            backgroundColor: brandConfig.colors.primary,
                          }}
                        >
                          {user.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">
                        {user.full_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <Badge
                        variant="secondary"
                        className="w-fit text-xs mt-1"
                        style={{
                          backgroundColor: `${brandConfig.colors.primary}15`,
                          color: brandConfig.colors.primary,
                        }}
                      >
                        {ROLE_DISPLAY_NAMES[currentRole]}
                      </Badge>
                    </div>
                    <DropdownMenuSeparator />

                    {/* FIXED: Feedback button outside DropdownMenuItem */}
                    <div className="px-2 py-1.5">
                      <FeedbackComponent className="w-full">
                        <button className="w-full flex items-center gap-2 text-sm text-blue-600 rounded-md transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          <span>HelpDesk</span>
                        </button>
                      </FeedbackComponent>
                    </div>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 bg-gray-50/50 overflow-auto">
            <div className="p-4 sm:p-6 lg:p-5 min-h-full">{children}</div>
          </main>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}