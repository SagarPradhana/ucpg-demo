import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/types";
import { getMetadataValue } from "@/utils/metadataUtils";
import { loginActions } from "@/store/loginReducer";
import { singleUserDetailsActions } from "@/store/singleUserDetailsReducer";
import { jwtDecode } from "jwt-decode";
import TokenManager from "@/utils/tokenManager";
import NotFound from "@/pages/NotFound";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // Whether route requires authentication
  allowedRoles?: string[]; // Which roles are allowed to access this route
  blockAdmins?: boolean; // Whether to block admin users from this route
  requireNonUser?: boolean; // Whether to require non-user role (for admin access)
  redirectTo?: string; // Where to redirect if access is denied
}

interface DecodedToken {
  id: string;
  name: string;
  email: string;
  role?: string;
  exp: number;
  metadata?: {
    role?: string;
    isAdmin?: boolean;
  };
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  allowedRoles = ["user"], // Default to allowing regular users
  blockAdmins = false,
  requireNonUser = false, // Default to false for backward compatibility
  redirectTo = "/login",
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(true);

  const authUser = useSelector((store: RootState) => store.auth.userDetails);
  const dispatch = useDispatch();
  const location = useLocation();

  // Validate and load user from token
  useEffect(() => {
    const validateUser = async () => {
      try {
        setIsValidating(true);

        // If we already have user in Redux, validate token
        if (authUser) {
          const token = localStorage.getItem("sessionToken");
          if (token) {
            const decodedUser = jwtDecode<DecodedToken>(token);
            const currentTime = Date.now() / 1000;

            if (decodedUser.exp <= currentTime) {
              // Token expired
              console.log("Token expired, clearing user");
              handleLogout();
              setIsLoading(false);
              setIsValidating(false);
              return;
            }
          }
          setIsLoading(false);
          setIsValidating(false);
          return;
        }

        // Try to load user from token
        const token = localStorage.getItem("sessionToken");
        if (token) {
          try {
            const decodedUser = jwtDecode<DecodedToken>(token);
            const currentTime = Date.now() / 1000;

            if (decodedUser.exp > currentTime) {
              // Token is valid, set user in Redux
              dispatch(loginActions.setUserDetails(decodedUser as any));

              // Initialize token manager
              const tokenManager = TokenManager.getInstance();
              tokenManager.initialize(() => {
                handleLogout();
              });

              setIsLoading(false);
              setIsValidating(false);
              return;
            } else {
              // Token expired
              console.log("Token expired during validation");
              handleLogout();
            }
          } catch (error) {
            console.error("Error decoding token:", error);
            handleLogout();
          }
        }

        setIsLoading(false);
        setIsValidating(false);
      } catch (error) {
        console.error("Error validating user:", error);
        setIsLoading(false);
        setIsValidating(false);
      }
    };

    validateUser();
  }, [authUser, dispatch]);

  const handleLogout = () => {
    // Safely clear authentication data while preserving user preferences
    const tokenManager = TokenManager.getInstance();
    tokenManager.safeLogout();
    dispatch(loginActions.clearUserDetails());
    dispatch(singleUserDetailsActions.clearSingleUserDetails());
  };

  const checkUserRole = (user: any): string => {
    // Check various places where role might be stored
    if (user.role) return user.role;
    if (user.metadata?.role) return user.metadata.role;
    if (user.metadata?.isAdmin) return "super_admin";
    return "user"; // Default to user role
  };

  const isUserAllowed = (user: any): boolean => {
    const userRole = checkUserRole(user);

    // If route requires non-user role (admin access), check that user is not a regular user
    if (requireNonUser && userRole === "user") {
      return false;
    }

    // If route blocks admins and user is not a regular user, deny access
    if (blockAdmins && userRole !== "user") {
      return false;
    }

    // If requireNonUser is true, allow any non-user role
    if (requireNonUser && userRole !== "user") {
      return true;
    }

    // Check if user role is in allowed roles
    return allowedRoles.includes(userRole);
  };

  // Show loading spinner while validating
  if (isLoading || isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If route doesn't require auth, allow access
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If no user is authenticated, redirect to login
  if (!authUser) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user is allowed to access this route
  if (!isUserAllowed(authUser)) {
    // If user is not allowed (e.g., admin trying to access user routes), show 404
    return <NotFound />;
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

// Higher-order component for easier route protection
export const withProtection = (
  Component: React.ComponentType<any>,
  options: Omit<ProtectedRouteProps, "children"> = {}
) => {
  return (props: any) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

export default ProtectedRoute;
