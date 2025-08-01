// Debug component to show Dashboard state in real-time
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  User,
  Database,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface DashboardDebugInfoProps {
  userDataLoading: boolean;
  userData: any;
  userDataError: any;
  onRefetch: () => void;
}

const DashboardDebugInfo: React.FC<DashboardDebugInfoProps> = ({
  userDataLoading,
  userData,
  userDataError,
  onRefetch,
}) => {
  const authUser = useSelector((state: RootState) => state.auth.userDetails);
  const singleUserDetails = useSelector(
    (state: RootState) => state.singleUserDetails
  );
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const getStatusBadge = (
    condition: boolean,
    trueText: string,
    falseText: string
  ) => {
    return (
      <Badge variant={condition ? "default" : "secondary"}>
        {condition ? `✅ ${trueText}` : `❌ ${falseText}`}
      </Badge>
    );
  };

  const hasSessionToken = !!localStorage.getItem("sessionToken");

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Dashboard Debug Information
          <Button
            onClick={onRefetch}
            size="sm"
            variant="outline"
            disabled={userDataLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${userDataLoading ? "animate-spin" : ""}`}
            />
            Refetch
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Authentication Status */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            Authentication Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {getStatusBadge(hasSessionToken, "Session Token", "No Token")}
            {getStatusBadge(isAuthenticated, "Authenticated", "Not Auth")}
            {getStatusBadge(!!authUser, "Auth User", "No Auth User")}
            {getStatusBadge(!!authUser?.id, "Has User ID", "No User ID")}
          </div>
        </div>

        {/* User Data Sources */}
        <div>
          <h3 className="font-semibold mb-2">User Data Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Auth User */}
            <div className="p-3 border rounded">
              <h4 className="font-medium text-sm mb-2">
                Auth User (from token)
              </h4>
              <div className="space-y-1 text-xs">
                <div>
                  ID: <code>{authUser?.id || "null"}</code>
                </div>
                <div>
                  Email: <code>{authUser?.email || "null"}</code>
                </div>
                <div>
                  Name: <code>{authUser?.name || "null"}</code>
                </div>
              </div>
            </div>

            {/* Single User Details */}
            <div className="p-3 border rounded">
              <h4 className="font-medium text-sm mb-2">
                Single User Details (from API)
              </h4>
              <div className="space-y-1 text-xs">
                <div>
                  ID: <code>{singleUserDetails.userDetails?.id || "null"}</code>
                </div>
                <div>
                  Email:{" "}
                  <code>{singleUserDetails.userDetails?.email || "null"}</code>
                </div>
                <div>
                  Loading:{" "}
                  {getStatusBadge(singleUserDetails.loading, "Loading", "Idle")}
                </div>
                <div>
                  Error:{" "}
                  <code className="text-red-600">
                    {singleUserDetails.error || "none"}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Query Status */}
        <div>
          <h3 className="font-semibold mb-2">API Query Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {getStatusBadge(!!authUser?.id, "Query Enabled", "Query Disabled")}
            {getStatusBadge(userDataLoading, "Loading", "Idle")}
            {getStatusBadge(!!userData, "Has Data", "No Data")}
            {getStatusBadge(!userDataError, "No Error", "Has Error")}
          </div>

          {userDataError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div>
                <div className="font-medium text-red-800">API Query Error:</div>
                <div className="text-sm text-red-600">
                  {userDataError.message || String(userDataError)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Flow Status */}
        <div>
          <h3 className="font-semibold mb-2">Expected Flow Progress</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {hasSessionToken ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <span className="text-sm">
                1. Session token exists in localStorage
              </span>
            </div>
            <div className="flex items-center gap-2">
              {authUser ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <span className="text-sm">
                2. Token decoded and authUser loaded in Redux
              </span>
            </div>
            <div className="flex items-center gap-2">
              {authUser?.id ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <span className="text-sm">
                3. User ID available for API query
              </span>
            </div>
            <div className="flex items-center gap-2">
              {userDataLoading || userData ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <span className="text-sm">4. API query triggered (getUser)</span>
            </div>
            <div className="flex items-center gap-2">
              {singleUserDetails.userDetails ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <span className="text-sm">
                5. Fresh user data loaded in singleUserDetails
              </span>
            </div>
          </div>
        </div>

        {/* Debug Actions */}
        <div>
          <h3 className="font-semibold mb-2">Debug Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if ((window as any).dashboardDebug) {
                  (window as any).dashboardDebug.logState();
                } else {
                  console.log("Debug tools not available");
                }
              }}
            >
              Log Full State
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if ((window as any).dashboardDebug && authUser?.id) {
                  (window as any).dashboardDebug.testUserFetch(authUser.id);
                } else {
                  console.log(
                    "Cannot test - no user ID or debug tools not available"
                  );
                }
              }}
              disabled={!authUser?.id}
            >
              Test Manual Fetch
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if ((window as any).dashboardDebug) {
                  (window as any).dashboardDebug.debugToken();
                } else {
                  console.log("Debug tools not available");
                }
              }}
            >
              Debug Token
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardDebugInfo;
