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
  const userProfileData = useSelector((state: RootState) => state.singleUserDetails.userProfileData);

  return {
    // User data
    userProfile: userProfileData,
    
    // Permission checking functions
    hasPermission: (permissionCode: string) => hasPermission(userProfileData, permissionCode),
    hasAnyPermission: (permissionCodes: string[]) => hasAnyPermission(userProfileData, permissionCodes),
    hasAllPermissions: (permissionCodes: string[]) => hasAllPermissions(userProfileData, permissionCodes),
    canAccessSection: (sectionId: string) => canAccessSection(userProfileData, sectionId),
    canPerformAction: (section: string, action: 'view' | 'add' | 'edit' | 'delete' | 'manage') => 
      canPerformAction(userProfileData, section, action),
    getAccessibleSections: () => getAccessibleSections(userProfileData),
    
    // Permission codes for easy access
    PERMISSIONS: PERMISSION_CODES,
    
    // Convenience methods for common checks
    canViewDashboard: () => hasPermission(userProfileData, PERMISSION_CODES.DASHBOARD_VIEW),
    canViewTransactions: () => hasPermission(userProfileData, PERMISSION_CODES.TRANSACTIONS_VIEW),
    canManageTransactions: () => hasPermission(userProfileData, PERMISSION_CODES.TRANSACTIONS_MANAGE),
    canCancelTransactions: () => hasPermission(userProfileData, PERMISSION_CODES.TRANSACTIONS_CANCEL),
    
    canViewPromoCodes: () => hasPermission(userProfileData, PERMISSION_CODES.PROMO_CODES_VIEW),
    canAddPromoCodes: () => hasPermission(userProfileData, PERMISSION_CODES.PROMO_CODES_ADD),
    canEditPromoCodes: () => hasPermission(userProfileData, PERMISSION_CODES.PROMO_CODES_EDIT),
    canDeletePromoCodes: () => hasPermission(userProfileData, PERMISSION_CODES.PROMO_CODES_DELETE),
    
    canViewProviders: () => hasPermission(userProfileData, PERMISSION_CODES.PROVIDERS_VIEW),
    canAddProviders: () => hasPermission(userProfileData, PERMISSION_CODES.PROVIDERS_ADD),
    canEditProviders: () => hasPermission(userProfileData, PERMISSION_CODES.PROVIDERS_EDIT),
    canDeleteProviders: () => hasPermission(userProfileData, PERMISSION_CODES.PROVIDERS_DELETE),
    
    canViewCommission: () => hasPermission(userProfileData, PERMISSION_CODES.COMMISSION_VIEW),
    canAddCommission: () => hasPermission(userProfileData, PERMISSION_CODES.COMMISSION_ADD),
    canEditCommission: () => hasPermission(userProfileData, PERMISSION_CODES.COMMISSION_EDIT),
    canDeleteCommission: () => hasPermission(userProfileData, PERMISSION_CODES.COMMISSION_DELETE),
    canManageCommission: () => hasPermission(userProfileData, PERMISSION_CODES.COMMISSION_MANAGE),
    
    canViewExchangeRates: () => hasPermission(userProfileData, PERMISSION_CODES.EXCHANGE_RATES_VIEW),
    canManageExchangeRates: () => hasPermission(userProfileData, PERMISSION_CODES.EXCHANGE_RATES_MANAGE),
    
    canViewUserRoles: () => hasPermission(userProfileData, PERMISSION_CODES.USER_ROLES_VIEW),
    canAddUserRoles: () => hasPermission(userProfileData, PERMISSION_CODES.USER_ROLES_ADD),
    canEditUserRoles: () => hasPermission(userProfileData, PERMISSION_CODES.USER_ROLES_EDIT),
    canDeleteUserRoles: () => hasPermission(userProfileData, PERMISSION_CODES.USER_ROLES_DELETE),
    canAssignUserRoles: () => hasPermission(userProfileData, PERMISSION_CODES.USER_ROLES_ASSIGN),
    canManageUserRoles: () => hasPermission(userProfileData, PERMISSION_CODES.USER_ROLES_MANAGE),
    
    canViewSettings: () => hasPermission(userProfileData, PERMISSION_CODES.SETTINGS_VIEW),
    canManageSettings: () => hasPermission(userProfileData, PERMISSION_CODES.SETTINGS_MANAGE),
    
    canViewErrorLogs: () => hasPermission(userProfileData, PERMISSION_CODES.ERROR_LOGS_VIEW),
    canDeleteErrorLogs: () => hasPermission(userProfileData, PERMISSION_CODES.ERROR_LOGS_DELETE),
    
    canViewReports: () => hasPermission(userProfileData, PERMISSION_CODES.REPORTS_VIEW),
    canExportReports: () => hasPermission(userProfileData, PERMISSION_CODES.REPORTS_EXPORT),
    
    canViewRevenueOps: () => hasPermission(userProfileData, PERMISSION_CODES.REVENUE_OPS_VIEW),
  };
};

export default usePermissions;
