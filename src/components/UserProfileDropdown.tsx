import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Settings,
  LogOut,
  Shield,
  HelpCircle,
  CreditCard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TokenManager from "@/utils/tokenManager";
import { loginActions } from "@/store/loginReducer";
import { singleUserDetailsActions } from "@/store/singleUserDetailsReducer";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/types";

interface UserProfileDropdownProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const UserProfileDropdown = ({ user }: UserProfileDropdownProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch();

  // Get user profile from Redux store (primary source)
  const userProfile = useSelector(
    (state: RootState) => state.singleUserDetails.userDetails
  ) as any;

  // Use Redux data if available, otherwise fall back to props, then defaults
  const userData = userProfile ||
    user || {
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "",
    };

  console.log("🔍 UserProfileDropdown: User data source", {
    hasReduxData: !!userProfile,
    hasPropsData: !!user,
    finalData: {
      name: userData?.name,
      email: userData?.email,
    },
  });

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleSettingsClick = () => {
    // Removed non-API settings toast
  };

  const handleLogout = () => {
    // Stop token monitoring and clear all tokens
    const tokenManager = TokenManager.getInstance();
    tokenManager.destroy();
    tokenManager.clearTokens();

    // Clear all Redux state
    dispatch(loginActions.clearUserDetails());
    dispatch(singleUserDetailsActions.clearSingleUserDetails());

    console.log("✅ UserProfileDropdown: All user data cleared on logout");

    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userData.avatar} alt={userData.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(userData.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" forceMount>
        {/* User Info Header */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {getInitials(userData.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {userData.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userData.email}
                </p>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Profile Option */}
        <DropdownMenuItem
          onClick={handleProfileClick}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>

        {/* Settings Option */}
        <DropdownMenuItem
          onClick={handleSettingsClick}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        {/* Billing Option */}
        <DropdownMenuItem
          onClick={() => {
            // Removed non-API billing toast
          }}
          className="cursor-pointer"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Billing</span>
        </DropdownMenuItem>

        {/* Security Option */}
        <DropdownMenuItem
          onClick={() => {
            // Removed non-API security toast
          }}
          className="cursor-pointer"
        >
          <Shield className="mr-2 h-4 w-4" />
          <span>Security</span>
        </DropdownMenuItem>

        {/* Help Option */}
        <DropdownMenuItem
          onClick={() => {
            // Removed non-API help toast
          }}
          className="cursor-pointer"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout Option */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
