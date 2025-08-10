import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit3,
  Save,
  X,
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
  Globe,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelector, useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { loginActions } from "@/store/loginReducer";
import { debugToken } from "@/utils/debugToken";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { RootState } from "@/types";
import { updateUserPessword, updateUserProfile } from "@/service/auth";
import { updateMetadata, getMetadataValue } from "@/utils/metadataUtils";
import { singleUserDetailsActions } from "@/store/singleUserDetailsReducer";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const authUser = useSelector((store: RootState) => store.auth.userDetails); // For getting user ID and initial auth
  const singleUserDetails = useSelector(
    (store: RootState) => store.singleUserDetails
  ) as any;

  // Use singleUserDetails as primary user data, fallback to authUser for ID when needed
  const userProfile = singleUserDetails?.userDetails?.data || authUser;
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { t, setLanguageFromProfile } = useLanguage();
  const queryClient = useQueryClient();
  console.log("UserProfile from Redux:", userProfile);

  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    country: "",
    currency: "",
    joinDate: "March 2024",
    avatar: "",
  });
  const navigate = useNavigate();

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData: any) =>
      updateUserProfile(profileData, authUser?.id || userProfile?.id),
    onSuccess: (res: any) => {
      setIsEditing(false);

      // Invalidate both user queries to trigger refetch and update store

      // Update both stores with the new profile data
      if (userProfile) {
        const updatedUser = {
          ...userProfile,
          name: profileData.name,
          metadata: updateMetadata(userProfile?.metadata || {}, {
            country: profileData.country,
            currency: profileData.currency,
          }),
        };

        // Update the singleUserDetails store
        dispatch(singleUserDetailsActions.setSingleUserDetails(updatedUser));

        // Also update the main auth.userDetails store (used by UserProfile dropdown)
        if (authUser) {
          const updatedAuthUser = {
            ...authUser,
            name: profileData.name,
            metadata: updateMetadata(authUser.metadata, {
              country: profileData.country,
              currency: profileData.currency,
            }),
          };
          dispatch(loginActions.setUserDetails(updatedAuthUser));
        }
      }

      // Force update the local profileData state to reflect the changes immediately
      setProfileData((prev) => ({
        ...prev,
        name: profileData.name,
        country: profileData.country,
        currency: profileData.currency,
      }));

      toast({
        title: t("profile.success"),
        description: res.message,
      });
    },
    onError: (error) => {
      console.error("Profile update failed:", error);
      toast({
        title: t("profile.error"),
        description: error?.message,
        variant: "destructive",
      });
    },
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: (passwordData: any) =>
      updateUserPessword(passwordData, authUser?.id || userProfile?.id),
    onSuccess: (res: any) => {
      // Invalidate both user queries to trigger refetch and update store
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast({
        title: t("profile.success"),
        description: res.message,
      });
    },
    onError: (error) => {
      console.error("Password change failed:", error);
      toast({
        title: t("profile.error"),
        description: error?.message,
        variant: "destructive",
      });
    },
  });

  // Load user data from token when component mounts
  useEffect(() => {
    const loadUserFromToken = () => {
      // If authUser is already loaded, stop loading
      if (authUser) {
        setIsLoadingUser(false);
        return;
      }

      const token = localStorage.getItem("sessionToken");
      if (token) {
        try {
          const decodedUser = jwtDecode<any>(token);
          console.log("Decoded user from token:", decodedUser);

          // Check if token is still valid
          const currentTime = Date.now() / 1000;
          if (decodedUser.exp > currentTime) {
            // Dispatch user details to Redux store
            dispatch(loginActions.setUserDetails(decodedUser));

            setIsLoadingUser(false);
          } else {
            // Token is expired, remove it
            console.log("Token is expired");
            localStorage.removeItem("sessionToken");
            navigate("/login");
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          localStorage.removeItem("sessionToken");
          navigate("/login");
        }
      } else {
        // No token found, redirect to login
        console.log("No token found");
        navigate("/login");
      }
    };

    loadUserFromToken();

    // Debug token info in development
    if (import.meta.env.MODE === "development") {
      debugToken();
    }
  }, [dispatch, navigate, authUser]);

  // Update profile data when userProfile changes (from API or JWT)
  useEffect(() => {
    if (userProfile) {
      setProfileData((prev: any) => ({
        ...prev,
        name: userProfile?.name || prev.name,
        email: userProfile?.email || prev.email,
        country:
          (getMetadataValue(userProfile?.metadata, "country") as string) ||
          prev.country,
        currency:
          (getMetadataValue(userProfile?.metadata, "currency") as string) ||
          prev.currency,
      }));

      // Initialize language from user profile metadata if available
      const userLanguage = getMetadataValue(userProfile?.metadata, "language");
      if (userLanguage) {
        setLanguageFromProfile(userLanguage as any);
      }
    }
  }, [userProfile, setLanguageFromProfile]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🔄 Profile: Updating profile for user ID:", userProfile?.id);

    const updatedMetadata = updateMetadata(userProfile?.metadata || {}, {
      country: profileData.country,
      currency: profileData.currency,
    });

    console.log("📝 Profile: Profile data:", {
      name: profileData.name,
      metadata: updatedMetadata,
    });

    // Use authUser.id for API calls since that's always available from JWT
    const userId = authUser?.id || userProfile?.id;
    if (!userId) {
      console.error("❌ No user ID available for profile update");
      toast({
        title: t("profile.error"),
        description: "User ID not found. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate({
      name: profileData.name,
      metadata: updatedMetadata,
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      // Removed non-API validation toast - this is client-side validation
      return;
    }

    if (passwordData.newPassword.length < 6) {
      // Removed non-API validation toast - this is client-side validation
      return;
    }

    // Use authUser.id for API calls since that's always available from JWT
    const userId = authUser?.id || userProfile?.id;
    console.log("🔄 Changing password for user ID:", userId);

    if (!userId) {
      console.error("❌ No user ID available for password change");
      toast({
        title: t("profile.error"),
        description: "User ID not found. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      email: userProfile?.email || authUser?.email,
      old_password: passwordData.currentPassword,
      new_password: passwordData.newPassword,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset any unsaved changes if needed
  };

  // Show loading while checking user authentication
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">{t("profile.loadingProfile")}</p>
        </div>
      </div>
    );
  }

  // List of countries (you may want to use a more comprehensive list)
  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "China",
    "India",
    // ... add more countries
  ];

  // List of currencies (you may want to use a more comprehensive list)
  const currencies = [
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "AUD",
    "CAD",
    "CHF",
    "CNY",
    "INR",
    // ... add more currencies
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t("profile.back")}</span>
            </Button>
            <h1 className="text-3xl font-bold">{t("profile.profile")}</h1>
          </div>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>{t("profile.verified")}</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>{t("profile.personalInformation")}</CardTitle>
                  <CardDescription>
                    {t("profile.personalInformationDesc")}
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>{t("profile.edit")}</span>
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>{t("profile.cancel")}</span>
                    </Button>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profileData.avatar} />
                      <AvatarFallback className="text-lg">
                        {profileData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("profile.fullName")}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t("profile.email")}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          disabled={true}
                          className="pl-10 bg-muted/50 cursor-not-allowed"
                          readOnly
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("profile.emailNote")}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">{t("profile.country")}</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Select
                          disabled={!isEditing}
                          value={profileData.country}
                          onValueChange={(value) =>
                            setProfileData((prev) => ({
                              ...prev,
                              country: value,
                            }))
                          }
                        >
                          <SelectTrigger className="pl-10">
                            <SelectValue
                              placeholder={t("profile.selectCountry")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">{t("profile.currency")}</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Select
                          disabled={!isEditing}
                          value={profileData.currency}
                          onValueChange={(value) =>
                            setProfileData((prev) => ({
                              ...prev,
                              currency: value,
                            }))
                          }
                        >
                          <SelectTrigger className="pl-10">
                            <SelectValue
                              placeholder={t("profile.selectCurrency")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency} value={currency}>
                                {currency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="w-full"
                    >
                      {updateProfileMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>{t("profile.saving")}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Save className="h-4 w-4" />
                          <span>{t("profile.save")}</span>
                        </div>
                      )}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Change Password */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.changePassword")}</CardTitle>
                <CardDescription>
                  {t("profile.changePasswordDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">
                      {t("profile.currentPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">
                      {t("profile.newPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        className="pr-10"
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
                    <Label htmlFor="confirmPassword">
                      {t("profile.confirmPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        className="pr-10"
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
                    disabled={changePasswordMutation.isPending}
                    className="w-full"
                  >
                    {changePasswordMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>{t("profile.changing")}</span>
                      </div>
                    ) : (
                      t("profile.changePassword")
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>{t("profile.accountInformation")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {t("profile.memberSince")}
                </span>
                <span className="text-sm font-medium">
                  {profileData.joinDate}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {t("profile.accountType")}
                </span>
                <Badge variant="outline">{t("profile.premium")}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {t("profile.status")}
                </span>
                <Badge className="bg-green-100 text-green-800">
                  {t("profile.active")}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
