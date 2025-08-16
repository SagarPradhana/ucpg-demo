// Route configuration for easy management
export const ROUTE_CONFIG = {
  // Public routes - no authentication required
  PUBLIC: {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    FORGOT_PASSWORD: '/forgotpassword',
  },
  
  // User routes - require authentication, block admin users
  USER: {
    DASHBOARD: '/dashboard',
    SEND: '/send',
    RECEIVE: '/receive',
    RECEIVE_WITH_ID: '/receive/:id',
    PROFILE: '/profile',
    SERVICES: '/services',
  },
  
  // Admin routes - only for non-user roles
  ADMIN: {
    PANEL: '/admin',
    DASHBOARD: '/admin/dashboard',
    TRANSACTIONS: '/admin/transactions',
    USER_ROLES: '/admin/user-roles',
    PROMO_CODES: '/admin/promo-codes',
    PROVIDERS: '/admin/providers',
    EXCHANGE_RATES: '/admin/exchange-rates',
    COMMISSION_SETTINGS: '/admin/commission-settings',
    SETTINGS: '/admin/settings',
    ERROR_LOGS: '/admin/error-logs',
    REPORTS: '/admin/reports',
  },
  
  // Error routes
  ERROR: {
    NOT_FOUND: '*',
  }
};

// Helper function to check if a path is a user route
export const isUserRoute = (path: string): boolean => {
  const userRoutes = Object.values(ROUTE_CONFIG.USER);
  return userRoutes.some(route => 
    path === route || path.startsWith(route.replace('/:id', ''))
  );
};

// Helper function to check if a path is an admin route
export const isAdminRoute = (path: string): boolean => {
  const adminRoutes = Object.values(ROUTE_CONFIG.ADMIN);
  return adminRoutes.some(route =>
    path === route || path.startsWith(route)
  );
};

// Helper function to check if a path is a public route
export const isPublicRoute = (path: string): boolean => {
  const publicRoutes = Object.values(ROUTE_CONFIG.PUBLIC);
  return publicRoutes.includes(path);
};