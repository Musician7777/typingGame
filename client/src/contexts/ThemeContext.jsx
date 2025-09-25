import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export const themes = [
  {
    id: "default",
    name: "Blue Ocean",
    primary: "#3b82f6",
    secondary: "#e2e8f0",
    description: "Clean and professional blue theme",
  },
  {
    id: "dark",
    name: "Dark Night",
    primary: "#3b82f6",
    secondary: "#1e293b",
    description: "Dark theme for low-light environments",
  },
  {
    id: "purple",
    name: "Purple Dream",
    primary: "#8b5cf6",
    secondary: "#f3e8ff",
    description: "Creative purple theme",
  },
  {
    id: "green",
    name: "Forest Green",
    primary: "#10b981",
    secondary: "#dcfce7",
    description: "Natural green theme",
  },
  {
    id: "orange",
    name: "Sunset Orange",
    primary: "#ea580c",
    secondary: "#ffedd5",
    description: "Warm orange theme",
  },
  {
    id: "rose",
    name: "Rose Garden",
    primary: "#e11d48",
    secondary: "#ffe4e6",
    description: "Elegant rose theme",
  },
  {
    id: "teal",
    name: "Ocean Teal",
    primary: "#0d9488",
    secondary: "#ccfbf1",
    description: "Refreshing teal theme",
  },
];

export function ThemeProvider({ children }) {
  // Initialize theme state directly from localStorage to prevent flash
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem("typing-game-theme");
    if (savedTheme && themes.find((theme) => theme.id === savedTheme)) {
      return savedTheme;
    }
    return "default";
  });

  // Apply theme to document immediately and save to localStorage
  useEffect(() => {
    if (currentTheme === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", currentTheme);
    }
    localStorage.setItem("typing-game-theme", currentTheme);
  }, [currentTheme]);

  // Apply initial theme immediately on mount
  useEffect(() => {
    if (currentTheme === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", currentTheme);
    }
  }, []);

  const changeTheme = (themeId) => {
    if (themes.find((theme) => theme.id === themeId)) {
      setCurrentTheme(themeId);
    }
  };

  const getCurrentThemeInfo = () => {
    return themes.find((theme) => theme.id === currentTheme) || themes[0];
  };

  const value = {
    currentTheme,
    changeTheme,
    themes,
    getCurrentThemeInfo,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
