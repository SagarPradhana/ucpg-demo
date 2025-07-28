# Refresh Token Implementation Guide

This document outlines how the refresh token functionality has been implemented in the Anonymous Local Crypto application.

## Overview

The application now supports automatic token refresh using JWT refresh tokens. When an access token expires, the system automatically attempts to refresh it using the `/auth/refreshtoken` endpoint without requiring the user to log in again.

## Key Components

### 1. **API Configuration**

**Endpoint**: `/auth/refreshtoken`
**Method**: `POST`
**Request Body**:
```json
{
  "refresh_token": "string"
}
```

**Response**:
```json
{
  "data": {
    "access_token": "new_jwt_access_token",
    "refresh_token": "new_jwt_refresh_token",
    "expires_in": 3600
  }
}
```

### 2. **Token Storage**

- **Access Token**: Stored in `localStorage` as `sessionToken`
- **Refresh Token**: Stored in `localStorage` as `refreshToken`

### 3. **Core Files Modified**

#### `src/service/auth.tsx`
- Added `refreshToken()` function for API calls
- Updated `login()` function typing for proper token handling

#### `src/utils/tokenManager.ts`
- Enhanced with automatic refresh logic
- Added `attemptTokenRefresh()` and `performTokenRefresh()` methods
- Includes retry logic and prevents multiple simultaneous refresh attempts
- Added `storeTokens()` and `clearTokens()` utility methods

#### `src/service/HttpClients.tsx`
- Added automatic 401 error handling
- Implements retry logic after successful token refresh
- Enhanced token retrieval with fallback support

#### `src/hooks/useTokenRefresh.ts`
- Custom hook for manual token refresh in components
- Provides error handling utilities for API calls

### 4. **Types**

Added new TypeScript interfaces in `src/types/index.ts`:
- `LoginResponse` - For login API response structure
- `RefreshTokenRequest` - For refresh token API request
- `RefreshTokenResponse` - For refresh token API response

## How It Works

### 1. **Login Process**
```typescript
// When user logs in successfully
const response = await login(credentials);

// Both tokens are stored
tokenManager.storeTokens(
  response.data.access_token,
  response.data.refresh_token
);

// Token monitoring starts
tokenManager.refreshTokenCheck();
```

### 2. **Automatic Refresh**
```typescript
// TokenManager checks token expiration every minute
// If token expires in ≤5 minutes: Shows warning and attempts refresh
// If token is expired: Attempts refresh or logs out user

// HTTP client automatically handles 401 errors
if (response.status === 401) {
  const refreshed = await tokenManager.manualRefresh();
  if (refreshed) {
    // Retry the original request with new token
    return await httpClient(url, options, retryCount + 1);
  }
}
```

### 3. **Manual Refresh**
```typescript
// Components can manually trigger refresh
const { refreshTokenIfExpired } = useTokenRefresh();

const success = await refreshTokenIfExpired();
if (success) {
  // Continue with API calls
} else {
  // User will be redirected to login
}
```

### 4. **Logout Process**
```typescript
// Clear all tokens and stop monitoring
const tokenManager = TokenManager.getInstance();
tokenManager.destroy();
tokenManager.clearTokens();

// Clear Redux state
dispatch(loginActions.clearUserDetails());
```

## Security Features

1. **Single Refresh Attempt**: Only one refresh attempt per expired token
2. **Secure Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
3. **Automatic Cleanup**: Failed refresh attempts clear all tokens
4. **No Auth Header**: Refresh requests don't include expired access tokens

## Testing

A `TokenTestComponent` is provided for development testing:

```typescript
import TokenTestComponent from '@/components/TokenTestComponent';

// Shows real-time token status, expiry times, and manual refresh buttons
<TokenTestComponent />
```

## Production Considerations

1. **Secure Storage**: Consider using httpOnly cookies instead of localStorage
2. **HTTPS Only**: Ensure all token operations happen over HTTPS
3. **Token Rotation**: Implement refresh token rotation if required
4. **Monitoring**: Add logging for token refresh events
5. **Rate Limiting**: Implement rate limiting on refresh endpoint

## Error Handling

The system handles various error scenarios:

- **No Refresh Token**: User redirected to login
- **Invalid Refresh Token**: All tokens cleared, user redirected to login
- **Network Errors**: Graceful degradation with user feedback
- **Concurrent Requests**: Multiple simultaneous refresh attempts are prevented

## Usage Examples

### Protecting API Calls
```typescript
// API calls automatically handle token refresh
const data = await updateUserProfile(profileData);
// If 401: auto-refresh → retry → return data
// If refresh fails: redirect to login
```

### Manual Token Management
```typescript
const tokenManager = TokenManager.getInstance();

// Check if token is valid
const isValid = tokenManager.isTokenValid();

// Get expiration time
const expiry = tokenManager.getTokenExpiration();

// Manual refresh
const refreshed = await tokenManager.manualRefresh();
```

This implementation provides seamless user experience by automatically handling token expiration while maintaining security best practices.