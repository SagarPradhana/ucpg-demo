import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";

interface LanguageToggleProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showLabel?: boolean;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({
  variant = "outline",
  size = "sm",
  showLabel = false,
}) => {
  const { language, setLanguage, t } = useLanguage();

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

  const getLanguageLabel = (): string => {
    return t(`language.${getLanguageName(language)}`);
  };

  const getLanguageName = (lang: Language): string => {
    switch (lang) {
      case "en":
        return "english";
      case "ru":
        return "russian";
      case "tr":
        return "turkish";
      default:
        return "english";
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="text-sm">{getLanguageFlag(language)}</span>
          {showLabel && (
            <span className="hidden sm:inline">{getLanguageLabel()}</span>
          )}
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
