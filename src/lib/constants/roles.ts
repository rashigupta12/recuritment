/* eslint-disable @typescript-eslint/no-explicit-any */
export type AllowedRole = 
  | 'Sales User'
  | 'Sales Manager' 
  | 'Projects Manager'
  | 'Projects User'
  | 'Delivery Manager';

export const ROLE_ROUTES: Record<AllowedRole, string> = {
  'Sales User': '/dashboard/sales-user',
  'Sales Manager': '/dashboard/sales-manager',
  'Projects Manager': '/dashboard/projects-manager',
  'Projects User': '/dashboard/projects-user',
  'Delivery Manager': '/dashboard/delivery-manager',
};

export const ROLE_DISPLAY_NAMES: Record<AllowedRole, string> = {
  'Sales User': 'Sales User',
  'Sales Manager': 'Sales Manager',
  'Projects Manager': 'Projects Manager',
  'Projects User': 'Projects User',
  'Delivery Manager': 'Delivery Manager',
};

export const ROLE_PERMISSIONS: Record<AllowedRole, string[]> = {
  'Sales User': ['leads:read', 'leads:create', 'leads:update'],
  'Sales Manager': ['leads:*', 'sales:manage', 'reports:sales'],
  'Projects Manager': ['projects:*', 'jobcards:*', 'teams:manage'],
  'Projects User': ['projects:read', 'jobcards:read', 'jobcards:update'],
  'Delivery Manager': ['delivery:*', 'schedules:*', 'reports:delivery'],
};

export const getAllowedRoles = (frappeRoles: any[]): AllowedRole[] => {
  if (!frappeRoles || !Array.isArray(frappeRoles)) {
    return [];
  }

  const roleNames = frappeRoles.map(r => {
    if (typeof r === 'string') return r;
    if (typeof r === 'object' && r !== null) {
      return r.role || r.name || '';
    }
    return '';
  }).filter(Boolean);

  const roleMap: Record<string, AllowedRole> = {
    'Sales User': 'Sales User',
    'Sales Manager': 'Sales Manager',
    'Projects Manager': 'Projects Manager',
    'Projects User': 'Projects User',
    'Delivery Manager': 'Delivery Manager',
  };

  const mappedRoles = new Set<AllowedRole>();
  
  for (const roleName of roleNames) {
    if (roleMap[roleName]) {
      mappedRoles.add(roleMap[roleName]);
    }
  }

  return Array.from(mappedRoles);
};