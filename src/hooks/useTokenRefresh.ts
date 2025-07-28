import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TokenManager from "@/utils/tokenManager";
import { useToast } from "@/hooks/use-toast";

export const useTokenRefresh = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const refreshTokenIfExpired = useCallback(async (): Promise<boolean> => {
    const tokenManager = TokenManager.getInstance();
    
    try {
      const refreshed = await tokenManager.manualRefresh();
      
      if (refreshed) {
        console.log("Token refreshed successfully");
        return true;
      } else {
        // Refresh failed, redirect to login
        console.log("Token refresh failed, redirecting to login");
        tokenManager.clearTokens();
        navigate("/login");
        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      tokenManager.clearTokens();
      navigate("/login");
      return false;
    }
  }, [navigate]);

  const handleApiError = useCallback(async (error: any, retryCallback?: () => Promise<any>) => {
    // Check if error is due to expired token (401 Unauthorized)
    if (error?.status === 401 || error?.message?.includes("401")) {
      console.log("API call failed with 401, attempting token refresh");
      
      const refreshed = await refreshTokenIfExpired();
      
      if (refreshed && retryCallback) {
        try {
          // Retry the original request with new token
          return await retryCallback();
        } catch (retryError) {
          console.error("Retry after token refresh failed:", retryError);
          throw retryError;
        }
      }
    }
    
    throw error;
  }, [refreshTokenIfExpired]);

  return {
    refreshTokenIfExpired,
    handleApiError,
  };
};