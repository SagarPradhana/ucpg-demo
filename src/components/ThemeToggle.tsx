import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { RootState } from "@/types";
import { updateUserProfile } from "@/service/auth";
import { singleUserDetailsActions } from "@/store/singleUserDetailsReducer";
import { useToast } from "@/hooks/use-toast";

interface ThemeToggleProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "outline",
  size = "sm",
  showLabel = false,
}) => {
  const { theme, setTheme, actualTheme } = useTheme();

  // Get user details from Redux store
  const singleUserDetails = useSelector(
    (state: RootState) => state.singleUserDetails.userDetails
  );
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  // Redux dispatch and toast hooks
  const dispatch = useDispatch();
  const { toast } = useToast();

  const getThemeIcon = () => {
    switch (actualTheme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
      default:
        return "Theme";
    }
  };

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    // Set theme immediately for UI responsiveness
    setTheme(newTheme);

    // If user is authenticated, update their profile with the new theme
    if (isAuthenticated && singleUserDetails?.id) {
      try {
        console.log(`🎨 Updating user profile with theme: ${newTheme}`);

        // Prepare the metadata update payload
        const currentMetadata = singleUserDetails.metadata || {};
        const updatedMetadata = {
          ...currentMetadata,
          theme: newTheme,
        };

        // Call the updateUserProfile API
        const response = await updateUserProfile(
          { metadata: updatedMetadata },
          singleUserDetails.id
        );

        if (response?.status === 200 || response?.data) {
          // Update Redux store with new user data
          const updatedUser = {
            ...singleUserDetails,
            metadata: updatedMetadata,
          };

          dispatch(singleUserDetailsActions.setSingleUserDetails(updatedUser));

          console.log(
            `✅ Theme ${newTheme} saved to user profile successfully`
          );

          toast({
            title: "Theme Updated",
            description: `Theme changed to ${newTheme}`,
          });
        }
      } catch (error) {
        console.error("❌ Failed to update user profile theme:", error);

        toast({
          title: "Theme Update Failed",
          description: "Theme changed locally but failed to save to profile",
          variant: "destructive",
        });
      }
    } else {
      console.log(
        `🎨 Theme ${newTheme} applied locally (no profile update for non-authenticated user)`
      );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          {getThemeIcon()}
          {showLabel && (
            <span className="hidden sm:inline">{getThemeLabel()}</span>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleThemeChange("light")}
          className="cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === "light" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("dark")}
          className="cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("system")}
          className="cursor-pointer"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === "system" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
