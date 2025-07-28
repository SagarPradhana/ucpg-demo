import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Shield, AlertCircle, CheckCircle } from "lucide-react";
import TokenManager from "@/utils/tokenManager";
import { jwtDecode } from "jwt-decode";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";

const TokenTestComponent: React.FC = () => {
  const [tokenInfo, setTokenInfo] = useState<{
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    accessTokenExpiry: string | null;
    timeUntilExpiry: string | null;
    isValid: boolean;
  }>({
    hasAccessToken: false,
    hasRefreshToken: false,
    accessTokenExpiry: null,
    timeUntilExpiry: null,
    isValid: false,
  });

  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const updateTokenInfo = () => {
    const accessToken = localStorage.getItem("sessionToken");
    const refreshToken = localStorage.getItem("refreshToken");

    let expiry = null;
    let timeUntil = null;
    let valid = false;

    if (accessToken) {
      try {
        const decoded = jwtDecode<User>(accessToken);
        expiry = new Date(decoded.exp * 1000).toLocaleString();
        const now = Date.now() / 1000;
        const secondsUntilExpiry = decoded.exp - now;

        if (secondsUntilExpiry > 0) {
          const minutes = Math.floor(secondsUntilExpiry / 60);
          const seconds = Math.floor(secondsUntilExpiry % 60);
          timeUntil = `${minutes}m ${seconds}s`;
          valid = true;
        } else {
          timeUntil = "EXPIRED";
          valid = false;
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    setTokenInfo({
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenExpiry: expiry,
      timeUntilExpiry: timeUntil,
      isValid: valid,
    });
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const tokenManager = TokenManager.getInstance();
      const success = await tokenManager.manualRefresh();

      if (success) {
        toast({
          title: "Token Refreshed",
          description: "Access token has been successfully refreshed",
        });
        updateTokenInfo();
      } else {
        toast({
          title: "Refresh Failed",
          description: "Failed to refresh the access token",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Manual refresh failed:", error);
      toast({
        title: "Refresh Error",
        description: "An error occurred while refreshing the token",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const clearAllTokens = () => {
    const tokenManager = TokenManager.getInstance();
    tokenManager.clearTokens();
    updateTokenInfo();
    toast({
      title: "Tokens Cleared",
      description: "All tokens have been removed from storage",
    });
  };

  useEffect(() => {
    updateTokenInfo();
    const interval = setInterval(updateTokenInfo, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Token Status
        </CardTitle>
        <CardDescription>Monitor access and refresh tokens</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Access Token:</span>
            <Badge variant={tokenInfo.hasAccessToken ? "default" : "secondary"}>
              {tokenInfo.hasAccessToken ? "Present" : "Missing"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Refresh Token:</span>
            <Badge
              variant={tokenInfo.hasRefreshToken ? "default" : "secondary"}
            >
              {tokenInfo.hasRefreshToken ? "Present" : "Missing"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Token Valid:</span>
            <Badge variant={tokenInfo.isValid ? "default" : "destructive"}>
              {tokenInfo.isValid ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" /> Valid
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" /> Invalid
                </>
              )}
            </Badge>
          </div>
        </div>

        {tokenInfo.accessTokenExpiry && (
          <div className="text-xs text-muted-foreground">
            <div>Expires: {tokenInfo.accessTokenExpiry}</div>
            {tokenInfo.timeUntilExpiry && (
              <div className="mt-1">
                Time left:{" "}
                <span
                  className={
                    tokenInfo.isValid ? "text-green-600" : "text-red-600"
                  }
                >
                  {tokenInfo.timeUntilExpiry}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleManualRefresh}
            disabled={refreshing || !tokenInfo.hasRefreshToken}
            size="sm"
            className="flex-1"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>

          <Button
            onClick={clearAllTokens}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Clear All
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          This component is for testing token refresh functionality in
          development.
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenTestComponent;
