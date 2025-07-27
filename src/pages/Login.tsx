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
import { useDispatch, useSelector } from "react-redux";
import { loginActions } from "@/store/loginReducer";
import { useLanguage } from "@/contexts/LanguageContext";
import { jwtDecode } from "jwt-decode";
import { login } from "@/service/auth";
import TokenManager from "@/utils/tokenManager";

interface DecodedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  metadata: any;
  is_active: boolean;
  timezone: number;
  exp: number;
  // Add other fields if present in token
}

const Login = () => {
  const [loginObj, setLoginObj] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login({
        email: loginObj.email,
        password: loginObj.password,
      });

      // Assuming the response includes a token and user details

      // Store the token in localStorage
      localStorage.setItem("sessionToken", response?.data?.access_token);
      const decodedUser = jwtDecode<DecodedUser>(response?.data?.access_token);

      // Dispatch user details to Redux store
      dispatch(loginActions.setUserDetails(decodedUser));

      // Refresh token manager to start monitoring the new token
      const tokenManager = TokenManager.getInstance();
      tokenManager.refreshTokenCheck();

      toast({
        title: t("auth.welcomeToUCPG"),
        description: response?.message,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: t("auth.incorrectCredentials"),
        description: t("auth.failedLogin"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-2xl font-bold">{t("app.title")}</h1>
          </div>
          <p className="text-muted-foreground text-sm">{t("app.fullName")}</p>
        </div>

        {/* Login Card */}
        <Card className="animate-scale-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {t("auth.welcomeBack")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("auth.signInDescription")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.enterEmail")}
                  value={loginObj?.email}
                  onChange={(e) =>
                    setLoginObj((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.enterPassword")}
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>{t("auth.signingIn")}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{t("auth.signIn")}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
            </form>

            <Separator />

            <div className="flex items-center justify-center space-x-1 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                {t("home.features.secureCrypto")}
              </span>
            </div>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              {t("auth.dontHaveAccount")}{" "}
              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
              >
                {t("auth.signup")}
              </Link>
            </p>
            {/* <div>
              <LoginButton
                botUsername={""}
                authCallbackUrl="/path/to/callback/url"
                buttonSize="large" // "large" | "medium" | "small"
                cornerRadius={5} // 0 - 20
                showAvatar={true} // true | false
                lang="en"
              />
            </div> */}
          </CardFooter>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center animate-fade-in">
          <div className="space-y-1">
            <div className="text-2xl">🌍</div>
            <p className="text-xs text-muted-foreground">
              {t("home.features.global")}
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">🔒</div>
            <p className="text-xs text-muted-foreground">
              {t("home.features.anonymous")}
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">⚡</div>
            <p className="text-xs text-muted-foreground">
              {t("home.features.instant")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
