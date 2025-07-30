# Role Selection Modal Feature

## Overview
This feature displays a role selection modal after successful login when the user has admin privileges. It allows users to choose between accessing the platform as an Administrator or as a regular User.

## How It Works

### 1. **Login Flow**
- User logs in with email and password
- Backend returns login response with `admin: true` flag
- Instead of direct navigation, the role selection modal appears
- User can choose their preferred access method

### 2. **Modal Features**
- **Two Role Cards**: Admin and User options
- **Visual Selection**: Click to select, shows visual feedback
- **Feature Lists**: Each role shows its key features
- **Security Notice**: Information about session security
- **Multi-language Support**: Available in English, Russian, and Turkish

### 3. **Role Options**

#### **Administrator Role**
- **Route**: `/admin`
- **Features**:
  - User Management
  - System Analytics
  - Platform Settings
  - Security Controls
  - Transaction Monitoring

#### **User Role**
- **Route**: `/dashboard`
- **Features**:
  - Send Payments
  - Receive Payments
  - Transaction History
  - Wallet Management
  - Anonymous Transactions

## API Response Format

For the modal to appear, the login response should include:

```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "access_token": "jwt_token_here",
    "refresh_token": "refresh_token_here",
    "admin": true,
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "admin"
    }
  }
}
```

### Key Fields:
- `admin: true` - Triggers the role selection modal
- `user` object - Provides user information for the modal display

## Implementation Details

### **Files Modified/Created:**

1. **`/src/components/RoleSelectionModal.tsx`** - Main modal component
2. **`/src/pages/Login.tsx`** - Integration with login flow
3. **`/src/types/index.ts`** - Updated LoginResponse interface
4. **Translation files** - Added role selection translations

### **State Management:**
- `showRoleModal`: Controls modal visibility
- `userInfo`: Stores user data for modal display
- Modal automatically closes after role selection

### **Navigation Logic:**
- **Admin selected**: Navigates to `/admin`
- **User selected**: Navigates to `/dashboard`
- **Modal closed without selection**: Defaults to `/dashboard`
- **No admin flag**: Direct navigation to `/dashboard`

## User Experience

### **Visual Design:**
- Clean, professional interface
- Gradient backgrounds for role cards
- Icons representing each role (Crown for Admin, User icon for User)
- Selected state with checkmark and highlighting
- Responsive design for mobile and desktop

### **Interaction Flow:**
1. User logs in successfully
2. Modal appears with welcome message
3. User sees two role options with descriptions
4. User clicks on preferred role (visual selection feedback)
5. User clicks "Proceed" button
6. Loading state shows briefly
7. User is navigated to the appropriate page

### **Fallback Behavior:**
- If user closes modal without selection → Navigate to dashboard
- If API doesn't return admin flag → Direct dashboard navigation
- If any error occurs → Fallback to dashboard navigation

## Testing

### **To Test Admin Flow:**
1. Ensure your backend returns `admin: true` in login response
2. Log in with admin credentials
3. Modal should appear after successful login
4. Test both role selections to verify navigation

### **To Test Regular User Flow:**
1. Ensure backend returns `admin: false` or omits admin field
2. Log in with regular user credentials
3. Should navigate directly to dashboard without modal

### **Modal Testing:**
- Test role selection and proceed button
- Test cancel functionality
- Test modal close button
- Test responsive design on different screen sizes
- Test in all supported languages (EN/RU/TR)

## Configuration

### **Backend Requirements:**
- Login endpoint must return `admin` boolean field
- Optional `user` object with name and email for display

### **Frontend Configuration:**
- No additional configuration needed
- Feature is automatically enabled when admin flag is present
- Translations are included for all supported languages

## Security Considerations

- **Session Security**: All tokens are handled securely
- **Role Validation**: Backend should validate actual permissions
- **Audit Logging**: Admin access includes additional security monitoring
- **Token Management**: Existing token management system is preserved

## Troubleshooting

### **Modal Not Appearing:**
- Check if login response includes `admin: true`
- Verify LoginResponse interface is updated
- Check browser console for any errors

### **Navigation Issues:**
- Verify routes exist (`/admin` and `/dashboard`)
- Check if user has proper permissions for selected route
- Ensure route guards are properly configured

### **Translation Issues:**
- Verify all translation keys are present in language files
- Check if correct language is selected
- Ensure translation context is available

---

This feature enhances the user experience by providing a clear choice for users with admin privileges while maintaining security and providing a smooth transition to their preferred platform view.