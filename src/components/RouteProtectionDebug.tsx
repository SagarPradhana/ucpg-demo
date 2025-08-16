import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { RootState } from "@/types";
import { getMetadataValue } from "@/utils/metadataUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  User,
  Crown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { isUserRoute, isAdminRoute, isPublicRoute } from "@/config/routes";

interface RouteProtectionDebugProps {
  className?: string;
}

const RouteProtectionDebug: React.FC<RouteProtectionDebugProps> = ({
  className,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const authUser = useSelector((store: RootState) => store.auth.userDetails);
  const location = useLocation();

  // Only show in development mode
  if (import.meta.env.MODE !== "development") {
    return null;
  }

  const checkUserRole = (user: any): string => {
    if (!user) return "none";
    if (user.role) return user.role;
    if (user.metadata?.role) return user.metadata.role;
    if (user.metadata?.isAdmin) return "admin";
    return "user";
  };

  const currentPath = location.pathname;
  const userRole = checkUserRole(authUser);
  const isAuthenticated = !!authUser;

  const routeType = isPublicRoute(currentPath)
    ? "public"
    : isAdminRoute(currentPath)
    ? "admin"
    : isUserRoute(currentPath)
    ? "user"
    : "unknown";

  const getAccessStatus = () => {
    if (routeType === "public") {
      return {
        status: "allowed",
        reason: "Public route - no authentication required",
      };
    }

    if (!isAuthenticated) {
      return {
        status: "denied",
        reason: "Not authenticated - would redirect to login",
      };
    }

    if (routeType === "admin") {
      if (userRole !== "user") {
        return {
          status: "allowed",
          reason: `Non-user role (${userRole}) accessing admin route`,
        };
      } else {
        return {
          status: "denied",
          reason: "Regular user trying to access admin route",
        };
      }
    }

    if (routeType === "user") {
      if (userRole === "admin") {
        return {
          status: "denied",
          reason: "Admin user blocked from user routes - would show 404",
        };
      } else if (userRole === "user") {
        return { status: "allowed", reason: "User accessing user route" };
      } else {
        return { status: "denied", reason: "Invalid user role" };
      }
    }

    return { status: "unknown", reason: "Route type not recognized" };
  };

  const accessStatus = getAccessStatus();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "allowed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "denied":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "allowed":
        return "bg-green-100 text-green-800 border-green-200";
      case "denied":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-orange-600" />;
      case "user":
        return <User className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const simulateError = () => {
    throw new Error(
      "Test error for ErrorBoundary - This is intentional for testing"
    );
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-20 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-background/95 backdrop-blur-sm border-primary/20"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm ${className}`}>
      <Card className="bg-background/95 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Route Protection Debug</span>
            </CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
            >
              <EyeOff className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {/* Current Route */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">
              Current Route
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {currentPath}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {routeType}
              </Badge>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">
              User Status
            </div>
            <div className="flex items-center space-x-2">
              {getRoleIcon(userRole)}
              <span className="text-sm">{userRole}</span>
              <Badge
                variant={isAuthenticated ? "default" : "destructive"}
                className="text-xs"
              >
                {isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </div>
            {authUser && (
              <div className="text-xs text-muted-foreground">
                {authUser.name} ({authUser.email})
              </div>
            )}
          </div>

          {/* Access Status */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">
              Access Status
            </div>
            <div
              className={`flex items-center space-x-2 p-2 rounded-md border ${getStatusColor(
                accessStatus.status
              )}`}
            >
              {getStatusIcon(accessStatus.status)}
              <span className="text-xs font-medium capitalize">
                {accessStatus.status}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {accessStatus.reason}
            </div>
          </div>

          {/* Test Actions */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">
              Test Actions
            </div>
            <div className="space-y-1">
              <Button
                onClick={simulateError}
                size="sm"
                variant="destructive"
                className="w-full text-xs h-7"
              >
                Test Error Boundary
              </Button>
            </div>
          </div>

          {/* Token Info */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">
              Token Status
            </div>
            <div className="text-xs">
              {localStorage.getItem("sessionToken") ? (
                <Badge variant="default" className="text-xs">
                  Token Present
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  No Token
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteProtectionDebug;
