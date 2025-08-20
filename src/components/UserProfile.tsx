import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Palette,
  Globe,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Check,
  UserCircle,
  Shield,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTE_CONFIG, isAdminRoute } from "@/config/routes";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { loginActions } from "@/store/loginReducer";
import { singleUserDetailsActions } from "@/store/singleUserDetailsReducer";
import TokenManager from "@/utils/tokenManager";
import {
  QueryObserverResult,
  RefetchOptions,
  useMutation,
} from "@tanstack/react-query";

import { RootState } from "@/types";
import { updateUserProfile } from "@/service/auth";
import { getMetadataValue, updateMetadata } from "@/utils/metadataUtils";

interface UserProfileProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  userProfileData: any;
  refetchProfile: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<unknown, Error>>;
}

const UserProfile = ({
  userName,
  userEmail,
  userAvatar,
  userProfileData,
  refetchProfile,
}: UserProfileProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme, actualTheme } = useTheme();
  const { language, setLanguage, setLanguageFromProfile, t } = useLanguage();

  // Prefer normalized user from Redux; fallback to provided query data
  const reduxUser = useSelector(
    (state: RootState) => (state as any).singleUserDetails.userDetails
  ) as any;
  const userProfile =
    reduxUser || (userProfileData as any)?.data || userProfileData || null;
  const dispatch = useDispatch();

  useEffect(() => {
    if (userProfile) {
      setTheme(userProfile?.metadata?.theme || ("light" as any));
      setLanguage(userProfile?.metadata?.language || ("en" as any));
    }
  }, [userProfile]);

  // Pages where theme/language updates should not trigger API calls
  const excludedPages = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  const isExcludedPage = excludedPages.includes(location.pathname);

  // Mutation for updating user profile
  const updateProfileMutation = useMutation({
    mutationFn: (payload: any) => updateUserProfile(payload, userProfile?.id),
    onSuccess: (data: any, variables: any) => {
      // Create updated user profile with new metadata using utility function
      refetchProfile();
      if (!isExcludedPage) {
        toast({
          title: t("profile.profileUpdated"),
          description: data?.message,
        });
      }
    },
    onError: (error: any) => {
      console.error("Profile update failed:", error);

      // Show error toast only if not on excluded pages
      if (!isExcludedPage) {
        toast({
          title: t("profile.updateFailed"),
          description: t("profile.updateFailedDesc"),
          variant: "destructive",
        });
      }
    },
  });

  // Use Redux data if available, otherwise fall back to props or defaults
  const displayName = userProfile?.name || userName || "";
  const displayEmail = userProfile?.email || userEmail || "";
  const displayAvatar = userAvatar;

  // Initialize language from user profile metadata when available
  useEffect(() => {
    const profileLanguage = getMetadataValue(
      userProfile?.metadata,
      "language"
    ) as Language;
    if (profileLanguage) {
      setLanguageFromProfile(profileLanguage);
    }
  }, [userProfile?.metadata, setLanguageFromProfile]);

  const handleProfileClick = () => {
    navigate("/profile");
    // Removed non-API navigation toast
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    // Apply immediately in UI
    setTheme(newTheme);
    // Optimistically update Redux metadata for instant UI reflection
    if (reduxUser) {
      dispatch(
        singleUserDetailsActions.setSingleUserDetails({
          ...reduxUser,
          metadata: { ...(reduxUser.metadata || {}), theme: newTheme },
        } as any)
      );
    }

    // Don't update profile API on excluded pages (login, signup, forgot password)
    if (!isExcludedPage && userProfile) {
      updateProfileMutation?.mutate({
        ...userProfile,
        metadata: {
          ...userProfile.metadata,
          theme: newTheme,
        },
      });
    } else {
      console.log(
        "Skipping theme API update - excluded page or no user profile"
      );
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    // Apply immediately in UI (direct set to avoid "first-call only" guard)
    setLanguage(newLanguage);
    // Optimistically update Redux metadata for instant UI reflection
    if (reduxUser) {
      dispatch(
        singleUserDetailsActions.setSingleUserDetails({
          ...reduxUser,
          metadata: { ...(reduxUser.metadata || {}), language: newLanguage },
        } as any)
      );
    }

    // Don't update profile API on excluded pages (login, signup, forgot password)
    if (!isExcludedPage && userProfile) {
      updateProfileMutation?.mutate({
        ...userProfile,
        metadata: {
          ...userProfile.metadata,
          language: newLanguage,
        },
      });
    } else {
      console.log(
        "Skipping language API update - excluded page or no user profile"
      );
    }
  };

  // Get user initials for fallback
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Load user data from token if Redux state is empty
  useEffect(() => {
    const loadUserFromToken = () => {
      // If userProfile is already loaded, don't reload
      if (userProfile) return;

      const token = localStorage.getItem("sessionToken");
      if (token) {
        try {
          const decodedUser = jwtDecode<any>(token);

          // Check if token is still valid
          const currentTime = Date.now() / 1000;
          if (decodedUser.exp > currentTime) {
            // Dispatch user details to Redux store
            dispatch(loginActions.setUserDetails(decodedUser));
          } else {
            // Token is expired, remove it and logout
            localStorage.removeItem("sessionToken");
            handleLogout();
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          localStorage.removeItem("sessionToken");
          handleLogout();
        }
      }
    };

    loadUserFromToken();
  }, [dispatch, userProfile]);

  // Initialize token manager
  useEffect(() => {
    const tokenManager = TokenManager.getInstance();
    tokenManager.initialize(() => {
      handleLogout();
    }, toast);

    // Cleanup on unmount
    return () => {
      tokenManager.destroy();
    };
  }, []);

  const handleLogout = () => {
    // Stop token monitoring and clear all tokens
    const tokenManager = TokenManager.getInstance();
    tokenManager.destroy();
    tokenManager.clearTokens();

    // Clear Redux state
    dispatch(loginActions.clearUserDetails());

    // Removed non-API logout toast
    navigate("/login");
  };

  const getLanguageFlag = (lang: Language): string => {
    switch (lang) {
      case "en":
        return "🇺🇸";
      case "ru":
        return "🇷🇺";
      case "tr":
        return "🇹🇷";
      default:
        return "🇺🇸";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-9 w-9 cursor-pointer border-2 border-transparent hover:border-primary/20 transition-all duration-200">
          <AvatarImage src={displayAvatar} alt={displayName || ""} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {getUserInitials(displayName || userEmail || "U")}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {displayEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleProfileClick}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>{t("profile.profile")}</span>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Palette className="mr-2 h-4 w-4" />
            <span>{t("profile.theme")}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {actualTheme === "dark" ? "🌙" : "☀️"}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => handleThemeChange("light")}
                className="cursor-pointer"
              >
                <Sun className="mr-2 h-4 w-4" />
                <span>{t("theme.light")}</span>
                {theme === "light" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleThemeChange("dark")}
                className="cursor-pointer"
              >
                <Moon className="mr-2 h-4 w-4" />
                <span>{t("theme.dark")}</span>
                {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleThemeChange("system")}
                className="cursor-pointer"
              >
                <Monitor className="mr-2 h-4 w-4" />
                <span>{t("theme.system")}</span>
                {theme === "system" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Globe className="mr-2 h-4 w-4" />
            <span>{t("profile.language")}</span>
            <span className="ml-auto text-xs">{getLanguageFlag(language)}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => handleLanguageChange("en")}
                className="cursor-pointer"
              >
                <span className="mr-2">🇺🇸</span>
                <span>{t("language.english")}</span>
                {language === "en" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange("ru")}
                className="cursor-pointer"
              >
                <span className="mr-2">🇷🇺</span>
                <span>{t("language.russian")}</span>
                {language === "ru" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange("tr")}
                className="cursor-pointer"
              >
                <span className="mr-2">🇹🇷</span>
                <span>{t("language.turkish")}</span>
                {language === "tr" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />

        {/* Portal Switching Buttons */}
        {userProfile?.role &&
          userProfile.role !== "user" &&
          (isAdminRoute(location.pathname) ? (
            <DropdownMenuItem
              onClick={() => navigate(ROUTE_CONFIG.USER.DASHBOARD)}
              className="cursor-pointer"
            >
              <UserCircle className="mr-2 h-4 w-4" />
              <span>User Portal</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => navigate(ROUTE_CONFIG.ADMIN.DASHBOARD)}
              className="cursor-pointer"
            >
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Portal</span>
            </DropdownMenuItem>
          ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("auth.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
