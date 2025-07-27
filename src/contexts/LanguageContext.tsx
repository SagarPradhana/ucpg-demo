import React, { createContext, useContext, useEffect, useState } from "react";
import { en } from "../translations/en";
import { ru } from "../translations/ru";
import { tr } from "../translations/tr";

export type Language = "en" | "ru" | "tr";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const translations = {
  en,
  ru,
  tr,
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = "en",
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Get language from localStorage or use default
    const savedLanguage = localStorage.getItem("ucpg-language") as Language;
    return savedLanguage || defaultLanguage;
  });

  // Save language to localStorage
  useEffect(() => {
    localStorage.setItem("ucpg-language", language);
    // Set document language
    document.documentElement.lang = language;
  }, [language]);

  // Translation function with parameter substitution
  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = translations[language];
    let text = (translation as any)[key];

    if (!text) {
      // Fallback to English if translation not found
      text = (translations.en as any)[key] || key;
    }

    // Replace parameters in the format {{paramName}}
    if (params && text) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(
          new RegExp(`{{${paramKey}}}`, "g"),
          String(paramValue)
        );
      });
    }

    return text;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
