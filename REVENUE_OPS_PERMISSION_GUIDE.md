# Revenue Ops Page — Permission Guide

## Overview
- **Goal**: Control access to the Revenue Ops admin page (`/admin/revenue-ops`).
- **Permission code**: `ROV` (RevenueOps - View)

Provided permission object:
```json
{
  "id": "aa302165-3637-456f-9586-512d6624f22e",
  "code": "ROV",
  "category": "RevenueOps",
  "description": "View revenue operations",
  "label": "RevenueOps - View"
}
```

## Where it’s wired in the codebase
- **Permission code**: `PERMISSION_CODES.REVENUE_OPS_VIEW = 'ROV'` in `src/utils/permissions.ts`.
- **Section mapping**: `SECTION_PERMISSIONS['revenue-ops'] = ['ROV']` in `src/utils/permissions.ts`.
- **Hook convenience**: `usePermissions().canViewRevenueOps()` in `src/hooks/usePermissions.ts`.
- **Route**: `ROUTE_CONFIG.ADMIN.REVENUE_OPS = '/admin/revenue-ops'` in `src/config/routes.ts`.

Note: The route is already admin-only via `<ProtectedRoute requireAuth requireNonUser>`. You must still gate the page content or menu with the `ROV` permission.

## Recommended usage patterns

### 1) Gate an entire page/section
Use `PermissionGuard` with either a section ID or direct permission code.

```tsx
// Example: wrapping the Revenue Ops page content
import { PermissionGuard } from "@/components/PermissionGuard";

export default function RevenueOpsPage() {
  return (
    <PermissionGuard section="revenue-ops" fallback={<div>Access denied</div>} showFallback>
      {/* Revenue Ops content goes here */}
      <div>Revenue Operations</div>
    </PermissionGuard>
  );
}
```

Alternative (direct permission code):
```tsx
<PermissionGuard permission="ROV">
  {/* content */}
</PermissionGuard>
```

### 2) Hide/show the admin menu item
Use the permissions hook or guard to conditionally render the nav link.

```tsx
// Using hook
import { usePermissions } from "@/hooks/usePermissions";
import { Link } from "react-router-dom";
import { ROUTE_CONFIG } from "@/config/routes";

function AdminNav() {
  const { canViewRevenueOps } = usePermissions();
  return (
    <nav>
      {canViewRevenueOps() && (
        <Link to={ROUTE_CONFIG.ADMIN.REVENUE_OPS}>Revenue Ops</Link>
      )}
    </nav>
  );
}
```

```tsx
// Using PermissionGuard
import { PermissionGuard } from "@/components/PermissionGuard";
import { Link } from "react-router-dom";
import { ROUTE_CONFIG } from "@/config/routes";

function AdminNav() {
  return (
    <nav>
      <PermissionGuard permission="ROV">
        <Link to={ROUTE_CONFIG.ADMIN.REVENUE_OPS}>Revenue Ops</Link>
      </PermissionGuard>
    </nav>
  );
}
```

### 3) Inline checks for specific controls
For fine-grained control (buttons, widgets), call the hook directly.

```tsx
const { canViewRevenueOps } = usePermissions();

{canViewRevenueOps() && (
  <Button onClick={() => {/* open revenue modal */}}>Open Revenue Panel</Button>
)}
```

## Backend expectations
- The authenticated user must include `'ROV'` in `user.permissions` for access.
- Super admins (`role === 'super_admin'`) bypass checks and can access all sections.

## Testing checklist
1. Login as user with `permissions: ['ROV']` → Revenue Ops nav visible; page content renders.
2. Login as user without `ROV` → nav hidden; direct URL shows fallback/blank (depending on implementation).
3. Login as `super_admin` → access allowed regardless of explicit `ROV`.
4. Ensure route remains admin-only (non-user) as configured in `App.tsx`.

## Troubleshooting
- If access is denied unexpectedly:
  - **Verify** `user.permissions` is an array of strings and includes `'ROV'`.
  - **Confirm** section key is exactly `'revenue-ops'` when using `section` API.
  - **Check** Redux user data (`state.singleUserDetails.userDetails`) is populated.
  - **Remember**: Route-level protection does not enforce permissions; use `PermissionGuard` or hook checks in the page/UI.