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
import { Shield, Coins, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { loginActions } from "@/store/loginReducer";
import { LoginButton } from "@telegram-auth/react";

const Login = () => {
  const [loginObj, setLoginObj] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login - replace with actual authentication
    if (
      loginObj?.email === "admin@gmail.com" &&
      loginObj?.password === "admin"
    ) {
      dispatch(loginActions.setUserDetails(loginObj));
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Welcome to UCPG",
          description: "Successfully logged in to your account.",
        });
        navigate("/dashboard");
      }, 1500);
    } else {
      toast({
        title: "Incorrect credentials",
        description: "Failed logged in to your account.",
      });
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
            <h1 className="text-2xl font-bold">UCPG</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Universal Crypto Payment Gateway
          </p>
        </div>

        {/* Login Card */}
        <Card className="animate-scale-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
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
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginObj?.password}
                  onChange={(e) =>
                    setLoginObj((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              <Button
                type="submit"
                className="w-full group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Sign in</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
            </form>

            <Separator />

            <div className="flex items-center justify-center space-x-1 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                Secure crypto payments
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
                Sign up
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
            <p className="text-xs text-muted-foreground">Global Access</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">🔒</div>
            <p className="text-xs text-muted-foreground">Anonymous</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">⚡</div>
            <p className="text-xs text-muted-foreground">Instant</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
