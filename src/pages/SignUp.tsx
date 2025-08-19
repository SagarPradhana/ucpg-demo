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
import { Shield, ArrowRight, Mail, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { GoogleLogin } from "@react-oauth/google";
import { LoginButton } from "@telegram-auth/react";
import { resendOtp, signUp, verifyOtp } from "@/service/auth";
import { useMutation } from "@tanstack/react-query";

// Interface for API responses that include OTP resend time
interface OtpApiResponse {
  data?: {
    otpResendTime?: number;
    [key: string]: unknown;
  };
  otpResendTime?: number;
  [key: string]: unknown;
}

// Utility function to extract OTP resend time from API response
const getOtpResendTime = (response: OtpApiResponse): number => {
  return response?.data?.otpResendTime || response?.otpResendTime || 120;
};

const Signup = () => {
  const [signupObj, setSignupObj] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Initial form, 2: OTP verification
  const [timer, setTimer] = useState(120); // 2 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: (signupData: {
      username: string;
      password: string;
      email: string;
    }) => signUp(signupData as any),
    onSuccess: (response) => {
      setStep(2);
      const otpResendTime = getOtpResendTime(response as any);
      setTimer(otpResendTime);
      setCanResend(false);

      toast({
        title: "OTP Sent",
        description: "An OTP has been sent to your email address.",
      });
    },
    onError: (err) => {
      console.error(err);
      toast({
        title: "Signup Failed",
        description: "An error occurred during signup. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: (otpData: { email: string; otp: string }) => verifyOtp(otpData),
    onSuccess: () => {
      toast({
        title: "Account Created",
        description: "Your account has been successfully created.",
      });
      navigate("/login");
    },
    onError: (error) => {
      console.error("OTP verification failed:", error);
      toast({
        title: "Verification Failed",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Resend OTP mutation
  const resendOtpMutation = useMutation({
    mutationFn: (otpData: { email: string }) => resendOtp(otpData),
    onSuccess: (response) => {
      const otpResendTime = getOtpResendTime(response as any);
      setTimer(otpResendTime);
      setCanResend(false);

      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your email address.",
      });
    },
    onError: (error) => {
      console.error("Failed to resend OTP:", error);
      toast({
        title: "Resend Failed",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (signupObj.password !== signupObj.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
      });
      return;
    }

    signupMutation.mutate({
      username: signupObj.name,
      password: signupObj.password,
      email: signupObj.email,
    });
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    verifyOtpMutation.mutate({
      email: signupObj.email,
      otp: otp,
    });
  };

  const handleResendOtp = () => {
    resendOtpMutation.mutate({
      email: signupObj.email,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center space-y-2 animate-fade-in">
          <div className="flex items-center justify-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">CryptoFlow</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Universal Crypto Payment Gateway
          </p>
        </div>

        {/* Signup Card */}
        <Card className="animate-scale-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Create Account
            </CardTitle>
            <CardDescription className="text-center">
              Choose your preferred signup method
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* <div className="space-y-2">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  console.log("Google Login Failed");
                }}
              /> */}

            {/* Telegram login - Requires actual bot setup */}
            {/* 
              <LoginButton
                botUsername="your_actual_bot_username"
                onAuthCallback={handleTelegramLogin}
                buttonSize="large"
                lang="en"
              />
              */}
            {/* </div> */}

            <Separator className="my-4" />

            {step === 1 && (
              <form onSubmit={handleInitialSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your Name"
                    value={signupObj.name}
                    onChange={(e) =>
                      setSignupObj((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupObj.email}
                    onChange={(e) =>
                      setSignupObj((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
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
                      value={signupObj.password}
                      onChange={(e) =>
                        setSignupObj((prev) => ({
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={signupObj.confirmPassword}
                      onChange={(e) =>
                        setSignupObj((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      required
                      className="transition-all duration-200 focus:scale-[1.02] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full group"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Sending OTP</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Sign Up</span>
                      <Mail className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full group"
                  disabled={verifyOtpMutation.isPending}
                >
                  {verifyOtpMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Verifying</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Verify and Sign Up</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>

                <div className="text-center">
                  {canResend ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendOtp}
                      disabled={resendOtpMutation.isPending}
                    >
                      {resendOtpMutation.isPending
                        ? "Resending..."
                        : "Resend OTP"}
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Resend OTP in {Math.floor(timer / 60)}:
                      {(timer % 60).toString().padStart(2, "0")}
                    </p>
                  )}
                </div>
              </form>
            )}

            <div className="flex items-center justify-center space-x-1 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                Secure Crypto Transactions
              </span>
            </div>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="grid grid-cols-3 gap-4 text-center animate-fade-in">
          <div className="space-y-1">
            <div className="text-2xl">🌍</div>
            <p className="text-xs text-muted-foreground">Global Access</p>
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
    </div>
  );
};

export default Signup;
