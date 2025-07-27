import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  id: string;
  name: string;
  email: string;
  role: string;
  metadata: any;
  is_active: boolean;
  timezone: number;
}

interface ToastFunction {
  (options: { title: string; description: string; variant?: "destructive" | "default" }): void;
}

class TokenManager {
  private static instance: TokenManager;
  private checkInterval: NodeJS.Timeout | null = null;
  private onLogout?: () => void;  
  private toastFn?: ToastFunction;

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

  // Check if token is expired
  private checkTokenExpiration() {
    const token = localStorage.getItem("sessionToken");
    
    if (!token) {
      return;
    }

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000; // Convert to seconds
      const timeUntilExpiry = decodedToken.exp - currentTime;

      // If token expires in 5 minutes or less, show warning
      if (timeUntilExpiry <= 300 && timeUntilExpiry > 0) {
        this.showExpirationWarning(Math.floor(timeUntilExpiry / 60));
      }

      // If token is expired, logout automatically
      if (timeUntilExpiry <= 0) {
        this.handleExpiredToken();
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      // If token is invalid, logout
      this.handleExpiredToken();
    }
  }

  // Show warning before token expires
  private showExpirationWarning(minutesLeft: number) {
    if (this.toastFn) {
      this.toastFn({
        title: "Session Warning",
        description: `Your session will expire in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}. Please save your work.`,
        variant: "destructive",
      });
    }
  }

  // Handle expired token
  private handleExpiredToken() {
    if (this.toastFn) {
      this.toastFn({
        title: "Session Expired", 
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
    }

    // Clear token from localStorage
    localStorage.removeItem("sessionToken");

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
      const decodedToken = jwtDecode<DecodedToken>(token);
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
      const decodedToken = jwtDecode<DecodedToken>(token);
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
}

export default TokenManager;