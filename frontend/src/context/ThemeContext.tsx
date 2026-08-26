import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "dark" | "light";
export type ThemeMode = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ern-theme-mode") as ThemeMode;
      if (saved === "light" || saved === "dark" || saved === "system") return saved;
    }
    return "light";
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("ern-theme-mode") as ThemeMode;
      if (savedMode === "light" || savedMode === "dark") return savedMode;
      if (savedMode === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
    }
    return "light";
  });

  // Handle system preference changes when in "system" mode
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const resolveTheme = (mode: ThemeMode): Theme => {
      if (mode === "system") {
        return mediaQuery.matches ? "dark" : "light";
      }
      return mode;
    };

    const newTheme = resolveTheme(themeMode);
    setThemeState(newTheme);

    const handleChange = () => {
      if (themeMode === "system") {
        setThemeState(mediaQuery.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode]);

  // Apply to DOM classList
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
    localStorage.setItem("ern-theme", theme);
    localStorage.setItem("ern-theme-mode", themeMode);
  }, [theme, themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    if (mode === "system") {
      const sysTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setThemeState(sysTheme);
    } else {
      setThemeState(mode);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeMode(newTheme);
  };

  const toggleTheme = () => {
    setThemeMode(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
