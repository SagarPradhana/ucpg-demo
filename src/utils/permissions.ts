// Permission utility functions for admin access control

export interface Permission {
  id: string;
  code: string;
  category: string;
  description: string;
  label: string;
}

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
  is_deleted?: boolean;
  created_at?: number;
  updated_at?: number;
  created_by?: string;
  updated_by?: string;
  ipaddress?: string;
  metadata?: {
    theme?: string;
    country?: string;
    currency?: string;
    language?: string;
  };
  permissions?: string[]; // Array of permission codes like ["DBV", "TRV", ...]
  menus?: string[]; // Array of menu names like ["Dashboard", "Transactions", ...]
  last_login?: string | null;
}

// Permission codes mapping to admin sections
export const PERMISSION_CODES = {
  // Dashboard
  DASHBOARD_VIEW: 'DBV',
  
  // Transactions
  TRANSACTIONS_VIEW: 'TRV',
  TRANSACTIONS_MANAGE: 'TRM',
  TRANSACTIONS_CANCEL: 'TRC',
  
  // Promo Codes
  PROMO_CODES_VIEW: 'PCV',
  PROMO_CODES_ADD: 'PCA',
  PROMO_CODES_EDIT: 'PCE',
  PROMO_CODES_DELETE: 'PCD',
  
  // Providers
  PROVIDERS_VIEW: 'PRV',
  PROVIDERS_ADD: 'PRA',
  PROVIDERS_EDIT: 'PRE',
  PROVIDERS_DELETE: 'PRD',
  
  // Commission
  COMMISSION_VIEW: 'CMV',
  COMMISSION_ADD: 'CMA',
  COMMISSION_EDIT: 'CME',
  COMMISSION_DELETE: 'CMD',
  COMMISSION_MANAGE: 'CMM',
  
  // Exchange Rates
  EXCHANGE_RATES_VIEW: 'ERV',
  EXCHANGE_RATES_MANAGE: 'ERM',
  
  // User Roles
  USER_ROLES_VIEW: 'URV',
  USER_ROLES_ADD: 'URA',
  USER_ROLES_EDIT: 'URE',
  USER_ROLES_DELETE: 'URD',
  USER_ROLES_ASSIGN: 'URAU',
  USER_ROLES_MANAGE: 'URM',
  
  // Settings
  SETTINGS_VIEW: 'STV',
  SETTINGS_MANAGE: 'STM',
  
  // Error Logs
  ERROR_LOGS_VIEW: 'ELV',
  ERROR_LOGS_DELETE: 'ELD',
  
  // Reports
  REPORTS_VIEW: 'RPV',
  REPORTS_EXPORT: 'RPE',
  
  // Revenue Ops
  REVENUE_OPS_VIEW: 'ROV',
} as const;

// Admin section permission requirements
export const SECTION_PERMISSIONS = {
  dashboard: [PERMISSION_CODES.DASHBOARD_VIEW],
  transactions: [PERMISSION_CODES.TRANSACTIONS_VIEW],
  'promo-codes': [PERMISSION_CODES.PROMO_CODES_VIEW],
  providers: [PERMISSION_CODES.PROVIDERS_VIEW],
  commission: [PERMISSION_CODES.COMMISSION_VIEW],
  'commission-settings': [PERMISSION_CODES.COMMISSION_VIEW],
  'exchange-rates': [PERMISSION_CODES.EXCHANGE_RATES_VIEW],
  'user-roles': [PERMISSION_CODES.USER_ROLES_VIEW],
  settings: [PERMISSION_CODES.SETTINGS_VIEW],
  'error-logs': [PERMISSION_CODES.ERROR_LOGS_VIEW],
  reports: [PERMISSION_CODES.REPORTS_VIEW],
  'revenue-ops': [PERMISSION_CODES.REVENUE_OPS_VIEW],
} as const;

/**
 * Check if user has a specific permission
 */
export const hasPermission = (userProfile: UserProfile | null, permissionCode: string): boolean => {
  // Handle case where API response might be wrapped in a 'data' property
  const userData = (userProfile as any)?.data || userProfile;

  // Super admin bypass - if user is super_admin, grant all permissions
  if (userData?.role === 'super_admin') {
    console.log("🔑 hasPermission: Super admin bypass - granting access");
    return true;
  }

  console.log("🔍 hasPermission check:", {
    originalUserProfile: userProfile,
    extractedUserData: userData,
    permissionCode: permissionCode,
    role: userData?.role,
    permissions: userData?.permissions,
    hasPermissions: !!userData?.permissions,
    isArray: Array.isArray(userData?.permissions),
    includes: userData?.permissions?.includes(permissionCode)
  });

  if (!userData?.permissions || !Array.isArray(userData.permissions)) {
    console.log("❌ hasPermission: No permissions or not array");
    return false;
  }

  // permissions is now an array of strings (permission codes)
  const result = userData.permissions.includes(permissionCode);
  console.log(`🔑 hasPermission result for "${permissionCode}":`, result);
  return result;
};

/**
 * Check if user has any of the required permissions
 */
export const hasAnyPermission = (userProfile: UserProfile | null, permissionCodes: string[]): boolean => {
  const userData = (userProfile as any)?.data || userProfile;
  if (!userData?.permissions || permissionCodes.length === 0) {
    return false;
  }
  
  return permissionCodes.some(code => hasPermission(userProfile, code));
};

/**
 * Check if user has all required permissions
 */
export const hasAllPermissions = (userProfile: UserProfile | null, permissionCodes: string[]): boolean => {
  const userData = (userProfile as any)?.data || userProfile;
  if (!userData?.permissions || permissionCodes.length === 0) {
    return false;
  }
  
  return permissionCodes.every(code => hasPermission(userProfile, code));
};

/**
 * Check if user can access a specific admin section
 */
export const canAccessSection = (userProfile: UserProfile | null, sectionId: string): boolean => {
  console.log(`🏢 canAccessSection check for "${sectionId}"`);

  // Handle case where API response might be wrapped in a 'data' property
  const userData = (userProfile as any)?.data || userProfile;

  // Super admin bypass - if user is super_admin, grant access to all sections
  if (userData?.role === 'super_admin') {
    console.log(`👑 canAccessSection: Super admin bypass for "${sectionId}" - granting access`);
    return true;
  }

  const requiredPermissions = SECTION_PERMISSIONS[sectionId as keyof typeof SECTION_PERMISSIONS];
  console.log(`📋 Required permissions for "${sectionId}":`, requiredPermissions);

  if (!requiredPermissions) {
    console.log(`❌ No required permissions defined for section "${sectionId}"`);
    return false;
  }

  // User needs at least one of the required permissions for the section
  const result = hasAnyPermission(userProfile, requiredPermissions);
  console.log(`🔐 canAccessSection result for "${sectionId}":`, result);
  return result;
};

/**
 * Get all accessible admin sections for a user
 */
export const getAccessibleSections = (userProfile: UserProfile | null): string[] => {
  console.log("🔍 getAccessibleSections called with:", userProfile);

  // Handle case where API response might be wrapped in a 'data' property
  const userData = (userProfile as any)?.data || userProfile;

  if (!userData?.permissions) {
    console.log("❌ getAccessibleSections: No permissions found");
    return [];
  }

  const accessibleSections = Object.keys(SECTION_PERMISSIONS).filter(sectionId => {
    const hasAccess = canAccessSection(userProfile, sectionId);
    console.log(`🔑 getAccessibleSections: Section "${sectionId}" access:`, hasAccess);
    return hasAccess;
  });

  console.log("📋 getAccessibleSections result:", accessibleSections);
  return accessibleSections;
};

/**
 * Check if user can perform a specific action in a section
 */
export const canPerformAction = (
  userProfile: UserProfile | null, 
  section: string, 
  action: 'view' | 'add' | 'edit' | 'delete' | 'manage'
): boolean => {
  if (!userProfile?.permissions) {
    return false;
  }
  
  // Map section and action to permission code
  const getPermissionCode = (section: string, action: string): string | null => {
    const sectionUpper = section.toUpperCase().replace('-', '_');
    const actionUpper = action.toUpperCase();
    
    // Special cases for specific permission codes
    if (section === 'user-roles' && action === 'assign') {
      return PERMISSION_CODES.USER_ROLES_ASSIGN;
    }
    
    // General pattern: SECTION_ACTION
    const permissionKey = `${sectionUpper}_${actionUpper}` as keyof typeof PERMISSION_CODES;
    return PERMISSION_CODES[permissionKey] || null;
  };
  
  const permissionCode = getPermissionCode(section, action);
  return permissionCode ? hasPermission(userProfile, permissionCode) : false;
};
