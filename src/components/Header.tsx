import { Shield } from "lucide-react";
import UserProfileDropdown from "./UserProfileDropdown";

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const Header = ({ user }: HeaderProps) => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold">UCPG</h1>
        </div>

        {/* Navigation - Add your navigation items here */}
        <nav className="hidden md:flex items-center space-x-6">
          {/* Add navigation items */}
        </nav>

        {/* User Profile Dropdown */}
        <div className="flex items-center space-x-4">
          <UserProfileDropdown user={user} />
        </div>
      </div>
    </header>
  );
};

export default Header;
