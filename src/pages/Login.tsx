import { useState, useEffect } from "react";
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
import { singleUserDetailsActions } from "@/store/singleUserDetailsReducer";
import { useLanguage } from "@/contexts/LanguageContext";

import { jwtDecode } from "jwt-decode";
import { login, getUser } from "@/service/auth";
import TokenManager from "@/utils/tokenManager";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User, LoginCredentials, ApiResponse, LoginResponse } from "@/types";
import { getMetadataValue, fixMalformedMetadata } from "@/utils/metadataUtils";
import RoleSelectionModal from "@/components/RoleSelectionModal";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [loginObj, setLoginObj] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [hasUsedRoleModal, setHasUsedRoleModal] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [shouldFetchProfile, setShouldFetchProfile] = useState(false);

  // Initialize userId from auth state if available
  useEffect(() => {
    if (user?.id && !userId) {
      setUserId(user.id);
    }
  }, [user?.id, userId]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { setLanguageFromProfile } = useLanguage();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && isAuthenticated && !showRoleModal && !hasUsedRoleModal) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, navigate, showRoleModal, hasUsedRoleModal]);

  // Query for fetching user profile - enabled when user is authenticated
  const getUserProfileQuery = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => {
      if (!userId) {
        throw new Error("User ID not available");
      }
      console.log("🔄 Login: Fetching user profile for ID:", userId);
      return getUser(userId);
    },
    enabled: (shouldFetchProfile || isAuthenticated) && !!userId,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Handle query success and error with useEffect
  useEffect(() => {
    if (getUserProfileQuery.isSuccess && getUserProfileQuery.data) {
      console.log(
        "✅ User profile data received and updating Redux:",
        getUserProfileQuery.data
      );

      dispatch(
        singleUserDetailsActions.setSingleUserDetails(
          getUserProfileQuery.data as User
        )
      );

      console.log("✅ User profile stored in Redux");

      // Only reset the fetch trigger if it was initiated by login
      if (shouldFetchProfile) {
        setShouldFetchProfile(false);
      }
    }
  }, [
    getUserProfileQuery.isSuccess,
    getUserProfileQuery.data,
    dispatch,
    shouldFetchProfile,
  ]);

  useEffect(() => {
    if (getUserProfileQuery.isError) {
      console.error(
        "❌ Failed to fetch user profile:",
        getUserProfileQuery.error
      );
      dispatch(
        singleUserDetailsActions.setSingleUserError(
          getUserProfileQuery.error?.message || "Failed to fetch user profile"
        )
      );

      // Show error toast only if it was triggered by login, not by background refetch
      if (shouldFetchProfile) {
        toast({
          title: "Profile Loading Failed",
          description: "Could not load user profile. Please refresh the page.",
          variant: "destructive",
        });

        // Reset the fetch trigger only if it was initiated by login
        setShouldFetchProfile(false);
      }
    }
  }, [
    getUserProfileQuery.isError,
    getUserProfileQuery.error,
    dispatch,
    toast,
    shouldFetchProfile,
  ]);

  // Utility functions for manual profile refetch
  const refetchProfile = (targetUserId?: string) => {
    const userIdToFetch = targetUserId || userId;
    if (userIdToFetch) {
      queryClient.invalidateQueries({
        queryKey: ["userProfile", userIdToFetch],
      });
    }
  };

  const refetchAllUserQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  const loginMutation = useMutation({
    mutationFn: (loginData: LoginCredentials) => login(loginData),
    onSuccess: (response: ApiResponse<LoginResponse>) => {
      if (!response?.data?.access_token || !response?.data?.refresh_token) {
        throw new Error("Invalid login response - missing tokens");
      }

      // Store both tokens using TokenManager
      const tokenManager = TokenManager.getInstance();
      tokenManager.storeTokens(
        response?.data?.access_token,
        response?.data?.refresh_token
      );

      const decodedUser = jwtDecode<User>(response?.data?.access_token);

      dispatch(loginActions.setUserDetails(decodedUser));

      const userLanguage = getMetadataValue(decodedUser?.metadata, "language");
      if (userLanguage) {
        setLanguageFromProfile(userLanguage as any);
      }

      tokenManager.refreshTokenCheck();

      toast({
        title: "Welcome to CryptoFlow",
        description: response?.message || "Login successful",
      });

      // Fetch user profile data immediately after login
      if (decodedUser?.id) {
        console.log(
          "🔄 Login: Starting user profile fetch for ID:",
          decodedUser.id
        );
        dispatch(singleUserDetailsActions.setLoading(true));
        setUserId(decodedUser.id);
        setShouldFetchProfile(true);
      }

      if (decodedUser?.role !== "user") {
        setUserInfo({
          name: response?.data?.user?.name || decodedUser?.name || "User",
          email:
            response?.data?.user?.email ||
            decodedUser?.email ||
            loginObj?.email,
        });
        // Show role selection modal and prevent useEffect from interfering
        setHasUsedRoleModal(true);
        setShowRoleModal(true);
      } else {
        if (getUserProfileQuery.isSuccess) {
          navigate("/dashboard");
        }
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
      email: loginObj?.email,
      password: loginObj?.password,
    });
  };

  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
    setUserInfo(null);
    setHasUsedRoleModal(true);
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
            <h1 className="text-2xl font-bold">CryptoFlow</h1>
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
                disabled={
                  loginMutation.isPending || getUserProfileQuery.isLoading
                }
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : getUserProfileQuery.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Loading Profile...</span>
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
