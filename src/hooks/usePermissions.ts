import { useSelector } from "react-redux";
import { RootState } from "@/types";
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  canAccessSection, 
  canPerformAction,
  getAccessibleSections,
  PERMISSION_CODES 
} from "@/utils/permissions";

/**
 * Hook to access permission utilities with current user data
 */
export const usePermissions = () => {
  // Fix: select the correct field from Redux (userDetails)
  const userDetails = useSelector((state: RootState) => state.singleUserDetails.userDetails);

  return {
    // User data
    userProfile: userDetails,
    
    // Permission checking functions
    hasPermission: (permissionCode: string) => hasPermission(userDetails, permissionCode),
    hasAnyPermission: (permissionCodes: string[]) => hasAnyPermission(userDetails, permissionCodes),
    hasAllPermissions: (permissionCodes: string[]) => hasAllPermissions(userDetails, permissionCodes),
    canAccessSection: (sectionId: string) => canAccessSection(userDetails, sectionId),
    canPerformAction: (section: string, action: 'view' | 'add' | 'edit' | 'delete' | 'manage') => 
      canPerformAction(userDetails, section, action),
    getAccessibleSections: () => getAccessibleSections(userDetails),
    
    // Permission codes for easy access
    PERMISSIONS: PERMISSION_CODES,
    
    // Convenience methods for common checks
    canViewDashboard: () => hasPermission(userDetails, PERMISSION_CODES.DASHBOARD_VIEW),
    canViewTransactions: () => hasPermission(userDetails, PERMISSION_CODES.TRANSACTIONS_VIEW),
    canManageTransactions: () => hasPermission(userDetails, PERMISSION_CODES.TRANSACTIONS_MANAGE),
    canCancelTransactions: () => hasPermission(userDetails, PERMISSION_CODES.TRANSACTIONS_CANCEL),
    
    canViewPromoCodes: () => hasPermission(userDetails, PERMISSION_CODES.PROMO_CODES_VIEW),
    canAddPromoCodes: () => hasPermission(userDetails, PERMISSION_CODES.PROMO_CODES_ADD),
    canEditPromoCodes: () => hasPermission(userDetails, PERMISSION_CODES.PROMO_CODES_EDIT),
    canDeletePromoCodes: () => hasPermission(userDetails, PERMISSION_CODES.PROMO_CODES_DELETE),
    
    canViewProviders: () => hasPermission(userDetails, PERMISSION_CODES.PROVIDERS_VIEW),
    canAddProviders: () => hasPermission(userDetails, PERMISSION_CODES.PROVIDERS_ADD),
    canEditProviders: () => hasPermission(userDetails, PERMISSION_CODES.PROVIDERS_EDIT),
    canDeleteProviders: () => hasPermission(userDetails, PERMISSION_CODES.PROVIDERS_DELETE),
    
    canViewCommission: () => hasPermission(userDetails, PERMISSION_CODES.COMMISSION_VIEW),
    canAddCommission: () => hasPermission(userDetails, PERMISSION_CODES.COMMISSION_ADD),
    canEditCommission: () => hasPermission(userDetails, PERMISSION_CODES.COMMISSION_EDIT),
    canDeleteCommission: () => hasPermission(userDetails, PERMISSION_CODES.COMMISSION_DELETE),
    canManageCommission: () => hasPermission(userDetails, PERMISSION_CODES.COMMISSION_MANAGE),
    
    canViewExchangeRates: () => hasPermission(userDetails, PERMISSION_CODES.EXCHANGE_RATES_VIEW),
    canManageExchangeRates: () => hasPermission(userDetails, PERMISSION_CODES.EXCHANGE_RATES_MANAGE),
    
    canViewUserRoles: () => hasPermission(userDetails, PERMISSION_CODES.USER_ROLES_VIEW),
    canAddUserRoles: () => hasPermission(userDetails, PERMISSION_CODES.USER_ROLES_ADD),
    canEditUserRoles: () => hasPermission(userDetails, PERMISSION_CODES.USER_ROLES_EDIT),
    canDeleteUserRoles: () => hasPermission(userDetails, PERMISSION_CODES.USER_ROLES_DELETE),
    canAssignUserRoles: () => hasPermission(userDetails, PERMISSION_CODES.USER_ROLES_ASSIGN),
    canManageUserRoles: () => hasPermission(userDetails, PERMISSION_CODES.USER_ROLES_MANAGE),
    
    canViewSettings: () => hasPermission(userDetails, PERMISSION_CODES.SETTINGS_VIEW),
    canManageSettings: () => hasPermission(userDetails, PERMISSION_CODES.SETTINGS_MANAGE),
    
    canViewErrorLogs: () => hasPermission(userDetails, PERMISSION_CODES.ERROR_LOGS_VIEW),
    canDeleteErrorLogs: () => hasPermission(userDetails, PERMISSION_CODES.ERROR_LOGS_DELETE),
    
    canViewReports: () => hasPermission(userDetails, PERMISSION_CODES.REPORTS_VIEW),
    canExportReports: () => hasPermission(userDetails, PERMISSION_CODES.REPORTS_EXPORT),
    
    canViewRevenueOps: () => hasPermission(userDetails, PERMISSION_CODES.REVENUE_OPS_VIEW),
  };
};

export default usePermissions;
