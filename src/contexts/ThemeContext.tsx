import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/types";
import { getMetadataValue } from "@/utils/metadataUtils";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: "light" | "dark"; // The actual resolved theme (light or dark)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "light", // Changed default to light instead of system
}) => {
  // Get user details from Redux store
  const authUser = useSelector((state: RootState) => state.auth.userDetails);
  const singleUserDetails = useSelector(
    (state: RootState) => state.singleUserDetails.userDetails
  );
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  // Function to get theme priority: user metadata (only for authenticated) > default light
  const getInitialTheme = (): Theme => {
    // Only apply user theme preferences for authenticated users
    if (isAuthenticated) {
      // Check singleUserDetails first (primary source)
      const singleUserTheme = getMetadataValue(
        singleUserDetails?.metadata,
        "theme"
      ) as Theme;
      if (
        singleUserTheme &&
        ["light", "dark", "system"].includes(singleUserTheme)
      ) {
        return singleUserTheme;
      }

      // Check authUser as fallback
      const authUserTheme = getMetadataValue(
        authUser?.metadata,
        "theme"
      ) as Theme;
      if (
        authUserTheme &&
        ["light", "dark", "system"].includes(authUserTheme)
      ) {
        return authUserTheme;
      }

      // For authenticated users without theme metadata, default to light
      return "light";
    }

    // For non-authenticated users, always use light theme (ignore localStorage)
    return "light";
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");

  // Update theme when user authentication status or user data changes
  useEffect(() => {
    const newTheme = getInitialTheme();
    if (newTheme !== theme) {
      setTheme(newTheme);
      console.log(`🎨 Theme updated from user metadata: ${newTheme}`);
    }
  }, [isAuthenticated, authUser?.metadata, singleUserDetails?.metadata]);

  // Function to get system preference
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  };

  // Update actual theme based on current theme setting
  useEffect(() => {
    const updateActualTheme = () => {
      let newActualTheme: "light" | "dark";

      if (theme === "system") {
        newActualTheme = getSystemTheme();
      } else {
        newActualTheme = theme as "light" | "dark";
      }

      setActualTheme(newActualTheme);

      // Apply theme to document
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(newActualTheme);
    };

    updateActualTheme();

    // Listen for system theme changes
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => updateActualTheme();

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  // Theme logging and persistence (only for authenticated users)
  useEffect(() => {
    // Log the theme source for debugging
    if (isAuthenticated) {
      const userTheme =
        getMetadataValue(singleUserDetails?.metadata, "theme") ||
        getMetadataValue(authUser?.metadata, "theme");
      if (userTheme) {
        console.log(`🎨 Theme applied from user metadata: ${theme}`);
      } else {
        console.log(
          `🎨 Theme applied (authenticated user, no metadata): ${theme}`
        );
      }

      // Only save to localStorage for authenticated users
      localStorage.setItem("ucpg-theme", theme);
    } else {
      console.log(
        `🎨 Theme applied (non-authenticated, always light): ${theme}`
      );
      // For non-authenticated users, don't save to localStorage
      // This ensures public pages always start with light theme
    }
  }, [theme, isAuthenticated, authUser?.metadata, singleUserDetails?.metadata]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    actualTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export default ThemeProvider;
