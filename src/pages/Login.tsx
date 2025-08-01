import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Coins, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { loginActions } from "@/store/loginReducer";
import { useLanguage } from "@/contexts/LanguageContext";

import { jwtDecode } from "jwt-decode";
import { login } from "@/service/auth";
import TokenManager from "@/utils/tokenManager";
import { useMutation } from "@tanstack/react-query";
import { User, LoginCredentials, ApiResponse, LoginResponse } from "@/types";
import { getMetadataValue } from "@/utils/metadataUtils";
import RoleSelectionModal from "@/components/RoleSelectionModal";

const Login = () => {
  const [loginObj, setLoginObj] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { setLanguageFromProfile } = useLanguage();

  const loginMutation = useMutation({
    mutationFn: (loginData: LoginCredentials) => login(loginData),
    onSuccess: (response: ApiResponse<LoginResponse>) => {
      if (!response?.data?.access_token || !response?.data?.refresh_token) {
        throw new Error("Invalid login response - missing tokens");
      }

      // Store both tokens using TokenManager
      const tokenManager = TokenManager.getInstance();
      tokenManager.storeTokens(
        response.data.access_token,
        response.data.refresh_token
      );

      // Decode user from access token
      const decodedUser = jwtDecode<User>(response.data.access_token);

      // Dispatch user details to Redux store
      dispatch(loginActions.setUserDetails(decodedUser));

      // Initialize language from user profile if available
      const userLanguage = getMetadataValue(decodedUser?.metadata, "language");
      if (userLanguage) {
        setLanguageFromProfile(userLanguage as any);
      }

      // Start token monitoring with refresh capability
      tokenManager.refreshTokenCheck();

      // Show success toast
      toast({
        title: "Welcome to UCPG",
        description: response?.message || "Login successful",
      });

      // Check if user has admin privileges
      if (response.data.superadmin === true) {
        // Set user info for the modal
        setUserInfo({
          name: response.data.user?.name || decodedUser.name || "User",
          email:
            response.data.user?.email || decodedUser.email || loginObj.email,
        });
        // Show role selection modal
        setShowRoleModal(true);
      } else {
        // Navigate directly to dashboard for regular users
        navigate("/dashboard");
      }
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
      toast({
        title: "Incorrect Credentials",
        description: error?.message || "Login failed. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      email: loginObj.email,
      password: loginObj.password,
    });
  };

  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
    setUserInfo(null);
    // Navigate to dashboard as fallback if modal is closed without selection
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center space-y-2 animate-fade-in">
          <div className="flex items-center justify-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">UCPG</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Universal Crypto Payment Gateway
          </p>
        </div>

        {/* Login Card */}
        <Card className="animate-scale-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginObj?.email}
                  onChange={(e) =>
                    setLoginObj((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginObj?.password}
                    onChange={(e) =>
                      setLoginObj((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                    className="transition-all duration-200 focus:scale-[1.02] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link
                    to="/forgotpassword"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full group"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
            </form>

            <Separator />

            <div className="flex items-center justify-center space-x-1 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                Secure Cryptocurrency Payments
              </span>
            </div>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center animate-fade-in">
          <div className="space-y-1">
            <div className="text-2xl">🌍</div>
            <p className="text-xs text-muted-foreground">Global Payments</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">🔒</div>
            <p className="text-xs text-muted-foreground">Anonymous & Secure</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">⚡</div>
            <p className="text-xs text-muted-foreground">Instant Processing</p>
          </div>
        </div>
      </div>

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={handleCloseRoleModal}
        userInfo={userInfo || undefined}
      />
    </div>
  );
};

export default Login;
