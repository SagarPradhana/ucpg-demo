import React from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionGuardProps {
  children: React.ReactNode;
  
  // Permission checking options (use one of these)
  permission?: string; // Single permission code
  permissions?: string[]; // Multiple permissions (requires ANY)
  allPermissions?: string[]; // Multiple permissions (requires ALL)
  section?: string; // Section access check
  sectionAction?: {
    section: string;
    action: 'view' | 'add' | 'edit' | 'delete' | 'manage';
  };
  
  // Custom permission check function
  customCheck?: () => boolean;
  
  // What to render when permission is denied
  fallback?: React.ReactNode;
  
  // Whether to render nothing (default) or the fallback when denied
  showFallback?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions
 * 
 * @example
 * // Single permission
 * <PermissionGuard permission="TRV">
 *   <TransactionsList />
 * </PermissionGuard>
 * 
 * @example
 * // Multiple permissions (any)
 * <PermissionGuard permissions={["PCA", "PCE"]}>
 *   <PromoCodeActions />
 * </PermissionGuard>
 * 
 * @example
 * // Section access
 * <PermissionGuard section="transactions">
 *   <TransactionsPage />
 * </PermissionGuard>
 * 
 * @example
 * // Section action
 * <PermissionGuard sectionAction={{ section: "promo-codes", action: "add" }}>
 *   <AddPromoCodeButton />
 * </PermissionGuard>
 * 
 * @example
 * // With fallback
 * <PermissionGuard 
 *   permission="TRM" 
 *   fallback={<div>You cannot manage transactions</div>}
 *   showFallback
 * >
 *   <ManageTransactionsButton />
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions,
  allPermissions,
  section,
  sectionAction,
  customCheck,
  fallback = null,
  showFallback = false,
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessSection,
    canPerformAction,
  } = usePermissions();

  // Determine if user has required permissions
  const hasAccess = (() => {
    // Custom check takes priority
    if (customCheck) {
      return customCheck();
    }
    
    // Single permission check
    if (permission) {
      return hasPermission(permission);
    }
    
    // Multiple permissions (any)
    if (permissions && permissions.length > 0) {
      return hasAnyPermission(permissions);
    }
    
    // Multiple permissions (all)
    if (allPermissions && allPermissions.length > 0) {
      return hasAllPermissions(allPermissions);
    }
    
    // Section access check
    if (section) {
      return canAccessSection(section);
    }
    
    // Section action check
    if (sectionAction) {
      return canPerformAction(sectionAction.section, sectionAction.action);
    }
    
    // Default: no access if no conditions specified
    return false;
  })();

  // Render based on access and fallback settings
  if (hasAccess) {
    return <>{children}</>;
  }
  
  if (showFallback && fallback) {
    return <>{fallback}</>;
  }
  
  return null;
};

export default PermissionGuard;
