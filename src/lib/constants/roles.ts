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
  console.log('=== ROLE DEBUGGING START ===');
  console.log('Raw frappeRoles input:', frappeRoles);
  
  if (!frappeRoles || !Array.isArray(frappeRoles)) {
    console.log('No valid roles array, returning empty array');
    return [];
  }

  // Extract role names from the Frappe structure
  const roleNames = frappeRoles.map((r, index) => {
    console.log(`Role ${index}:`, r);
    if (typeof r === 'string') {
      console.log(`Role ${index} is string:`, r);
      return r;
    }
    if (typeof r === 'object' && r !== null) {
      // Frappe stores role name in the 'role' property
      const roleName = r.role || r.name || '';
      console.log(`Role ${index} is object, extracted role name:`, roleName);
      return roleName;
    }
    console.log(`Role ${index} is neither string nor valid object`);
    return '';
  }).filter(Boolean);
  
  console.log('Extracted role names:', roleNames);
  
  // Map Frappe role names to your AllowedRole types
  // You need to check what actual role names exist in your Frappe system
  const roleMap: Record<string, AllowedRole> = {
    'Sales User': 'Sales User',
    'Sales Manager': 'Sales Manager',
    'Projects Manager': 'Projects Manager',
    'Projects User': 'Projects User',
    'Delivery Manager': 'Delivery Manager',
    
    'Employee': 'Sales User', // Example mapping
    // Check your Frappe system for actual role names and map them here
  };
  
  console.log('Available role mappings:', Object.keys(roleMap));
  
  const mappedRoles = new Set<AllowedRole>();
  
  // Map roles and add debug output
  for (const roleName of roleNames) {
    console.log(`Checking role: "${roleName}"`);
    if (roleMap[roleName]) {
      mappedRoles.add(roleMap[roleName]);
      console.log(`✅ Mapped: ${roleName} -> ${roleMap[roleName]}`);
    } else {
      console.log(`❌ Not mapped: ${roleName} (you may need to add this to roleMap)`);
    }
  }
  
  const finalRoles = Array.from(mappedRoles);
  console.log('Final mapped roles:', finalRoles);
  
  // If no roles mapped, log all available Frappe roles for debugging
  if (finalRoles.length === 0) {
    console.log('⚠️ No valid roles found! Available Frappe roles to map:', roleNames);
  }
  
  console.log('=== ROLE DEBUGGING END ===');
  
  return finalRoles;
};