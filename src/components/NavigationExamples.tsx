import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Settings, ExternalLink } from "lucide-react";

/**
 * NavigationExamples - Shows different ways to navigate to the profile page
 * This is just an example component showing various navigation patterns
 */
const NavigationExamples = () => {
  const navigate = useNavigate();

  // Method 1: Direct navigation function
  const goToProfile = () => {
    navigate("/profile");
  };

  // Method 2: With state passing (if you need to pass data)
  const goToProfileWithState = () => {
    navigate("/profile", {
      state: {
        from: "dashboard",
        selectedTab: "personal-info",
      },
    });
  };

  // Method 3: Open in new tab (if needed)
  const openProfileInNewTab = () => {
    window.open("/profile", "_blank");
  };

  return (
    <div className="space-y-4 p-6">
      <h3 className="text-lg font-semibold">Profile Navigation Examples</h3>

      {/* Simple button navigation */}
      <Button onClick={goToProfile} className="flex items-center space-x-2">
        <User className="h-4 w-4" />
        <span>Go to Profile</span>
      </Button>

      {/* Settings style button */}
      <Button
        variant="outline"
        onClick={goToProfile}
        className="flex items-center space-x-2"
      >
        <Settings className="h-4 w-4" />
        <span>Profile Settings</span>
      </Button>

      {/* Link style button */}
      <Button
        variant="ghost"
        onClick={goToProfile}
        className="flex items-center space-x-2 text-primary hover:text-primary/80"
      >
        <span>Edit Profile</span>
        <ExternalLink className="h-3 w-3" />
      </Button>

      {/* Navigation with state */}
      <Button
        variant="secondary"
        onClick={goToProfileWithState}
        className="flex items-center space-x-2"
      >
        <User className="h-4 w-4" />
        <span>Profile (with navigation state)</span>
      </Button>
    </div>
  );
};

export default NavigationExamples;
