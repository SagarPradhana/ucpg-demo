# Route Protection & Error Boundary System

## Overview
This system provides comprehensive route protection and error handling for the UCPG application. It ensures that users can only access routes they're authorized for and provides robust error recovery.

## Features

### 🔒 **Route Protection**
- **Authentication**: Verifies user tokens and login status
- **Role-based Access**: Controls access based on user roles (user/admin)
- **Admin Blocking**: Prevents admin users from accessing regular user routes
- **Automatic Redirects**: Handles unauthorized access gracefully

### 🚨 **Error Boundary**
- **Global Error Catching**: Catches JavaScript errors anywhere in the app
- **User-friendly Error Pages**: Shows helpful error messages instead of blank screens
- **Error Reporting**: Logs errors for debugging (can be extended to external services)
- **Recovery Options**: Provides retry, home, and report error buttons

## Route Categories

### **Public Routes** (No Authentication Required)
- `/` - Home page
- `/login` - Login page
- `/signup` - Signup page
- `/forgotpassword` - Forgot password page

### **User Routes** (Authenticated Users Only, Blocks Admins)
- `/dashboard` - User dashboard
- `/send` - Send payments
- `/receive` - Receive payments
- `/receive/:id` - Receive with ID
- `/profile` - User profile
- `/services` - Available services

### **Admin Routes** (Admin Users Only)
- `/admin` - Admin panel

### **Error Routes**
- `*` - 404 Not Found (catch-all)

## How It Works

### **Authentication Flow**
1. **Token Validation**: Checks JWT token in localStorage
2. **User Loading**: Decodes token and loads user data into Redux
3. **Role Checking**: Determines user role from token/metadata
4. **Access Control**: Grants or denies access based on route requirements

### **Protection Logic**
```typescript
// Example: User trying to access /dashboard
1. Check if route requires authentication ✅
2. Check if user is authenticated ✅
3. Check if user role is allowed (user) ✅
4. Check if admins are blocked ✅
5. Grant access ✅

// Example: Admin trying to access /dashboard
1. Check if route requires authentication ✅
2. Check if user is authenticated ✅
3. Check if user role is allowed (user) ❌ (user is admin)
4. Check if admins are blocked ✅
5. Show 404 Not Found ❌
```

## Error Boundary Features

### **Development Mode**
- Shows detailed error messages with stack traces
- Displays component stack information
- Provides error details for debugging

### **Production Mode**
- Shows user-friendly error messages
- Hides technical details from users
- Focuses on recovery options

### **Error Actions**
- **Try Again**: Attempts to re-render the component
- **Go to Home**: Navigates to the home page
- **Report Error**: Logs error details (can be extended)

## Usage Examples

### **Protecting a New Route**
```typescript
// In App.tsx
<Route 
  path="/new-user-route" 
  element={
    <ProtectedRoute 
      requireAuth={true} 
      allowedRoles={['user']} 
      blockAdmins={true}
    >
      <NewComponent />
    </ProtectedRoute>
  } 
/>
```

### **Creating Admin-Only Route**
```typescript
<Route 
  path="/admin/settings" 
  element={
    <ProtectedRoute 
      requireAuth={true} 
      allowedRoles={['admin']} 
      blockAdmins={false}
    >
      <AdminSettings />
    </ProtectedRoute>
  } 
/>
```

### **Using HOC Pattern**
```typescript
import { withProtection } from '@/components/ProtectedRoute';

const ProtectedComponent = withProtection(MyComponent, {
  requireAuth: true,
  allowedRoles: ['user'],
  blockAdmins: true
});
```

## Configuration

### **ProtectedRoute Props**
- `requireAuth?: boolean` - Whether route requires authentication (default: true)
- `allowedRoles?: string[]` - Which roles can access (default: ['user'])
- `blockAdmins?: boolean` - Whether to block admin users (default: false)
- `redirectTo?: string` - Where to redirect unauthorized users (default: '/login')

### **Role Detection**
The system checks for user roles in this order:
1. `user.role`
2. `user.metadata.role`
3. `user.metadata.isAdmin` (maps to 'admin')
4. Default: 'user'

## Testing

### **Test Scenarios**

#### **User Access**
1. **Valid User → Dashboard**: Should show dashboard
2. **Valid User → Admin**: Should show 404
3. **No Token → Dashboard**: Should redirect to login
4. **Expired Token → Dashboard**: Should redirect to login

#### **Admin Access**
1. **Admin → Dashboard**: Should show 404
2. **Admin → Admin Panel**: Should show admin panel
3. **Admin → Public Routes**: Should show pages normally

#### **Error Boundary**
1. **Component Error**: Should show error boundary UI
2. **Try Again**: Should attempt to re-render
3. **Go Home**: Should navigate to home page

## Security Considerations

### **Token Security**
- Tokens are validated on every protected route access
- Expired tokens are automatically cleared
- Invalid tokens trigger logout flow

### **Role Validation**
- Roles are checked server-side via JWT
- Client-side validation is for UX only
- Backend should always validate permissions

### **Error Information**
- Sensitive error details only shown in development
- Production errors are user-friendly and safe
- Error reporting can be configured for external services

## Troubleshooting

### **Common Issues**

#### **User Can't Access Dashboard**
1. Check if user token is valid
2. Verify user role in token
3. Ensure user role is 'user' not 'admin'
4. Check browser console for auth errors

#### **Admin Sees 404 on Dashboard**
- This is expected behavior
- Admins are blocked from user routes
- Direct admin to `/admin` instead

#### **Error Boundary Not Showing**
1. Ensure error occurs inside ErrorBoundary wrapper
2. Check browser console for actual errors
3. Verify ErrorBoundary is imported correctly

#### **Route Protection Not Working**
1. Check if ProtectedRoute is wrapping component
2. Verify route configuration in App.tsx
3. Check Redux store for user data
4. Ensure token is in localStorage

## Extending the System

### **Adding New Roles**
1. Update `allowedRoles` arrays in route definitions
2. Modify role detection logic in ProtectedRoute
3. Update backend to issue appropriate role claims

### **Custom Error Reporting**
```typescript
// In ErrorBoundary.tsx
const reportError = (errorDetails) => {
  // Send to external service
  fetch('/api/errors', {
    method: 'POST',
    body: JSON.stringify(errorDetails)
  });
};
```

### **Route-Specific Error Boundaries**
```typescript
// Wrap specific routes with custom error boundaries
<ErrorBoundary fallback={<CustomErrorPage />}>
  <ProtectedRoute>
    <SensitiveComponent />
  </ProtectedRoute>
</ErrorBoundary>
```

## Monitoring & Analytics

### **Error Tracking**
- All errors are logged to console
- Error IDs are generated for tracking
- Timestamps and user agent info included

### **Access Patterns**
- Failed auth attempts can be tracked
- Unauthorized access attempts logged
- User flow through protection system monitored

---

This system provides robust security and error handling while maintaining a smooth user experience. It's designed to be flexible and extensible as your application grows.