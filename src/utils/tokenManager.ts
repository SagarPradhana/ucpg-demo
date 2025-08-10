import { jwtDecode } from "jwt-decode";
import { User } from "@/types";
import { refreshToken } from "@/service/auth";
import StorageDebugger from "./storageDebugger";

interface ToastFunction {
  (options: { title: string; description: string; variant?: "destructive" | "default" }): void;
}

class TokenManager {
  private static instance: TokenManager;
  private checkInterval: NodeJS.Timeout | null = null;
  private onLogout?: () => void;  
  private toastFn?: ToastFunction;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  // Initialize token monitoring
  initialize(onLogout: () => void, toastFn?: ToastFunction) {
    this.onLogout = onLogout;
    this.toastFn = toastFn;
    this.startTokenCheck();
  }

  // Start checking token expiration every minute
  private startTokenCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkTokenExpiration();
    }, 60000); // Check every minute

    // Also check immediately
    this.checkTokenExpiration();
  }

  // Check if token is expired and handle refresh
  private async checkTokenExpiration() {
    const token = localStorage.getItem("sessionToken");
    
    if (!token) {
      return;
    }

    try {
      const decodedToken = jwtDecode<User>(token);
      const currentTime = Date.now() / 1000; // Convert to seconds
      const timeUntilExpiry = decodedToken.exp - currentTime;

      // If token expires in 5 minutes or less, try to refresh
      if (timeUntilExpiry <= 300 && timeUntilExpiry > 0) {
        this.showExpirationWarning(Math.floor(timeUntilExpiry / 60));
        await this.attemptTokenRefresh();
      }

      // If token is expired, try to refresh or logout
      if (timeUntilExpiry <= 0) {
        const refreshed = await this.attemptTokenRefresh();
        if (!refreshed) {
          this.handleExpiredToken();
        }
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      // If token is invalid, try to refresh or logout
      const refreshed = await this.attemptTokenRefresh();
      if (!refreshed) {
        this.handleExpiredToken();
      }
    }
  }

  // Attempt to refresh the access token
  private async attemptTokenRefresh(): Promise<boolean> {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      try {
        await this.refreshPromise;
        return true;
      } catch {
        return false;
      }
    }

    const refreshTokenValue = localStorage.getItem("refreshToken");
    
    if (!refreshTokenValue) {
      console.log("No refresh token available");
      return false;
    }

    // Set refreshing state
    this.isRefreshing = true;
    
    // Create refresh promise
    this.refreshPromise = this.performTokenRefresh(refreshTokenValue);
    
    try {
      await this.refreshPromise;
      this.isRefreshing = false;
      this.refreshPromise = null;
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.isRefreshing = false;
      this.refreshPromise = null;
      return false;
    }
  }

  // Perform the actual token refresh
  private async performTokenRefresh(refreshTokenValue: string): Promise<string> {
    try {
      // Try refresh with standard shape
      const response: any = await refreshToken({ refresh_token: refreshTokenValue } as any);

      // Support multiple response shapes: { data: { access_token, refresh_token } } or { access_token, refresh_token }
      const payload = response?.data ?? response;
      const newAccessToken = payload?.access_token || payload?.accessToken || payload?.token;
      const newRefreshToken = payload?.refresh_token || payload?.refreshToken;

      if (!newAccessToken) {
        throw new Error("No access token in refresh response");
      }

      // Store new tokens
      localStorage.setItem("sessionToken", newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      console.log("✅ Token refreshed successfully");
      return newAccessToken as string;
    } catch (error) {
      console.error("❌ Token refresh failed with error:", error);
      // If refresh fails, safely clear tokens while preserving preferences
      const storageDebugger = StorageDebugger.getInstance();
      storageDebugger.logStorageState("Before Refresh Failure Cleanup");
      storageDebugger.safeLogout();
      storageDebugger.logStorageState("After Refresh Failure Cleanup");
      throw error;
    }
  }

  // Show warning before token expires
  private showExpirationWarning(minutesLeft: number) {
    // Removed session warning toast - not an API response
  }

  // Handle expired token
  private handleExpiredToken() {
    // Removed session expired toast - not an API response

    const storageDebugger = StorageDebugger.getInstance();
    storageDebugger.logStorageState("Before Token Expiration Cleanup");

    // Safely clear tokens while preserving preferences
    storageDebugger.safeLogout();

    storageDebugger.logStorageState("After Token Expiration Cleanup");

    // Call logout callback
    if (this.onLogout) {
      this.onLogout();
    }
  }

  // Manually check if token is valid
  isTokenValid(): boolean {
    const token = localStorage.getItem("sessionToken");
    
    if (!token) {
      return false;
    }

    try {
      const decodedToken = jwtDecode<User>(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  // Get token expiration time
  getTokenExpiration(): Date | null {
    const token = localStorage.getItem("sessionToken");
    
    if (!token) {
      return null;
    }

    try {
      const decodedToken = jwtDecode<User>(token);
      return new Date(decodedToken.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  // Stop token checking
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Refresh token check (call after login)
  refreshTokenCheck() {
    this.startTokenCheck();
  }

  // Manually refresh token (public method)
  async manualRefresh(): Promise<boolean> {
    return await this.attemptTokenRefresh();
  }

  // Store tokens after login
  storeTokens(accessToken: string, refreshTokenValue: string) {
    localStorage.setItem("sessionToken", accessToken);
    localStorage.setItem("refreshToken", refreshTokenValue);
  }

  // Clear all tokens while preserving user preferences
  clearTokens() {
    // Preserve theme and language settings
    const theme = localStorage.getItem("ucpg-theme");
    const language = localStorage.getItem("ucpg-language");
    
    // Remove only authentication-related tokens
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("refreshToken");
    
    // Restore preserved settings
    if (theme) {
      localStorage.setItem("ucpg-theme", theme);
    }
    if (language) {
      localStorage.setItem("ucpg-language", language);
    }
  }

  // Safe logout that preserves user preferences
  safeLogout() {
    const storageDebugger = StorageDebugger.getInstance();
    storageDebugger.logStorageState("Before TokenManager Logout");
    
    // Use StorageDebugger's safe logout method
    storageDebugger.safeLogout();
    
    // Stop token checking
    this.destroy();
    
    storageDebugger.logStorageState("After TokenManager Logout");
  }
}

export default TokenManager;