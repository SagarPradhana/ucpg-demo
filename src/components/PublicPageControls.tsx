import React from "react";
import { Button } from "@/components/ui/button";
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
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  Globe,
  Settings,
  Check,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";

interface PublicPageControlsProps {
  className?: string;
}

const PublicPageControls: React.FC<PublicPageControlsProps> = ({
  className,
}) => {
  const { theme, setTheme, actualTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  const getLanguageName = (lang: Language): string => {
    switch (lang) {
      case "en":
        return "English";
      case "ru":
        return "Русский";
      case "tr":
        return "Türkçe";
      default:
        return "English";
    }
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
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-background/95 backdrop-blur-sm border-primary/20 hover:bg-primary/5"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {t("profile.preferences")}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {t("profile.customizeExperience")}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Theme Submenu */}
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

          {/* Language Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <Globe className="mr-2 h-4 w-4" />
              <span>{t("profile.language")}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {getLanguageFlag(language)}
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => handleLanguageChange("en")}
                  className="cursor-pointer"
                >
                  <span className="mr-2">🇺🇸</span>
                  <span>English</span>
                  {language === "en" && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleLanguageChange("ru")}
                  className="cursor-pointer"
                >
                  <span className="mr-2">🇷🇺</span>
                  <span>Русский</span>
                  {language === "ru" && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleLanguageChange("tr")}
                  className="cursor-pointer"
                >
                  <span className="mr-2">🇹🇷</span>
                  <span>Türkçe</span>
                  {language === "tr" && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PublicPageControls;
