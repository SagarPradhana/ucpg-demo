import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import { RootState } from "@/types";
import { jwtDecode } from "jwt-decode";
import { User } from "@/types";
import { RefreshCw } from "lucide-react";

const TokenDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<{
    sessionToken: string | null;
    refreshToken: string | null;
    decodedUser: User | null;
    reduxUser: User | null;
    isTokenValid: boolean;
    error: string | null;
  }>({
    sessionToken: null,
    refreshToken: null,
    decodedUser: null,
    reduxUser: null,
    isTokenValid: false,
    error: null,
  });

  // Get user profiles from both stores for debug comparison
  const authUserProfile = useSelector(
    (store: RootState) => store.auth.userDetails
  );
  const singleUserProfile = useSelector(
    (store: RootState) => store.singleUserDetails.userDetails
  );

  const updateDebugInfo = () => {
    try {
      const sessionToken = localStorage.getItem("sessionToken");
      const refreshToken = localStorage.getItem("refreshToken");

      let decodedUser = null;
      let isTokenValid = false;
      let error = null;

      if (sessionToken) {
        try {
          const decoded = jwtDecode<User>(sessionToken);
          decodedUser = decoded;

          const currentTime = Date.now() / 1000;
          isTokenValid = decoded.exp > currentTime;
        } catch (err) {
          error = `Token decode error: ${err}`;
        }
      }

      setDebugInfo({
        sessionToken,
        refreshToken,
        decodedUser,
        reduxUser: singleUserProfile || authUserProfile, // Prefer singleUserProfile
        isTokenValid,
        error,
      });
    } catch (err) {
      setDebugInfo((prev) => ({
        ...prev,
        error: `Debug error: ${err}`,
      }));
    }
  };

  useEffect(() => {
    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 2000);
    return () => clearInterval(interval);
  }, [authUserProfile, singleUserProfile]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          🐛 Token Debug Panel
          <Button onClick={updateDebugInfo} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Debug information for authentication tokens and user state
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Token Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Session Token:</span>
                <Badge
                  variant={debugInfo.sessionToken ? "default" : "secondary"}
                >
                  {debugInfo.sessionToken ? "Present" : "Missing"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Refresh Token:</span>
                <Badge
                  variant={debugInfo.refreshToken ? "default" : "secondary"}
                >
                  {debugInfo.refreshToken ? "Present" : "Missing"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Token Valid:</span>
                <Badge
                  variant={debugInfo.isTokenValid ? "default" : "destructive"}
                >
                  {debugInfo.isTokenValid ? "Valid" : "Invalid/Expired"}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">User Information</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">From Token:</span>
                <div className="text-xs text-muted-foreground mt-1">
                  ID: {debugInfo.decodedUser?.id || "N/A"}
                  <br />
                  Name: {debugInfo.decodedUser?.name || "N/A"}
                  <br />
                  Email: {debugInfo.decodedUser?.email || "N/A"}
                </div>
              </div>
              <div>
                <span className="font-medium">From Redux:</span>
                <div className="text-xs text-muted-foreground mt-1">
                  ID: {debugInfo.reduxUser?.id || "N/A"}
                  <br />
                  Name: {debugInfo.reduxUser?.name || "N/A"}
                  <br />
                  Email: {debugInfo.reduxUser?.email || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {debugInfo.error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive font-medium">Error:</p>
            <p className="text-xs text-destructive/80">{debugInfo.error}</p>
          </div>
        )}

        {debugInfo.sessionToken && (
          <div className="text-xs text-muted-foreground">
            <details>
              <summary className="cursor-pointer">
                Raw Token (Click to expand)
              </summary>
              <div className="mt-2 p-2 bg-muted rounded text-xs font-mono break-all">
                {debugInfo.sessionToken}
              </div>
            </details>
          </div>
        )}

        <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
          ⚠️ This debug panel should only be visible in development mode
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenDebugPanel;
