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
import { Shield, ArrowRight, Mail, KeyRound, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { forgotPassword, resendOtp, sendOtp } from "@/service/auth";

const ForgotPassword = () => {
  const [forgotPasswordObj, setForgotPasswordObj] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email form, 2: OTP verification and New password form
  const [timer, setTimer] = useState(120); // 2 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendOtp({
        email: forgotPasswordObj.email,
      });
      setIsLoading(false);
      setStep(2);
      setTimer(120);
      setCanResend(false);
      toast({
        title: "OTP Sent",
        description:
          "An OTP has been sent to your email address for password reset verification.",
      });
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      toast({
        title: "Request Failed",
        description:
          "An error occurred while processing your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (forgotPasswordObj.newPassword !== forgotPasswordObj.confirmPassword) {
      setIsLoading(false);
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (forgotPasswordObj.newPassword.length < 6) {
      setIsLoading(false);
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Verify OTP and reset password in one step
      await forgotPassword({
        email: forgotPasswordObj.email,
        otp: forgotPasswordObj.otp,
        password: forgotPasswordObj.newPassword,
      });

      setIsLoading(false);
      toast({
        title: "Password Reset Successful",
        description:
          "Your password has been successfully reset. You can now login with your new password.",
      });
      navigate("/login");
    } catch (error) {
      setIsLoading(false);
      console.error("Password reset failed:", error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await resendOtp({
        email: forgotPasswordObj.email,
      });

      setTimer(120);
      setCanResend(false);
      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your email address.",
      });
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      toast({
        title: "Resend Failed",
        description: "Failed to resend OTP. Please try again.",
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
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{t("app.title")}</h1>
          </div>
          <p className="text-muted-foreground text-sm">{t("app.fullName")}</p>
        </div>

        {/* Forgot Password Card */}
        <Card className="animate-scale-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {step === 1
                ? "Reset Password"
                : "Verify OTP and Set New Password"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1
                ? "Enter your email address to receive reset instructions"
                : "Enter the OTP sent to your email and set your new password"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 1 ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={forgotPasswordObj.email}
                    onChange={(e) =>
                      setForgotPasswordObj((prev) => ({
                        ...prev,
                        email: e.target.value,
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
                      <span>Sending OTP...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Send OTP</span>
                      <Mail className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={forgotPasswordObj.email}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={forgotPasswordObj.otp}
                    onChange={(e) =>
                      setForgotPasswordObj((prev) => ({
                        ...prev,
                        otp: e.target.value,
                      }))
                    }
                    required
                    maxLength={6}
                    className="transition-all duration-200 focus:scale-[1.02] text-center text-lg tracking-widest"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={forgotPasswordObj.newPassword}
                      onChange={(e) =>
                        setForgotPasswordObj((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      required
                      minLength={6}
                      className="transition-all duration-200 focus:scale-[1.02] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={forgotPasswordObj.confirmPassword}
                      onChange={(e) =>
                        setForgotPasswordObj((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      required
                      minLength={6}
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
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Resetting Password...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Reset Password</span>
                      <KeyRound className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>

                {/* Resend OTP section */}
                <div className="text-center space-y-2">
                  {canResend ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-sm"
                    >
                      Resend OTP
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
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Back to Login
              </Link>
            </p>
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

export default ForgotPassword;
