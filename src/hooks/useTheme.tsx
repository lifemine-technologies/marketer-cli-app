import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  toggleTheme: () => null,
  isDark: false,
};

const ThemeContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme,
  storageKey = "theme",
  ...props
}: ThemeProviderProps) {
  const systemTheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>(() => {
    // Will be set from AsyncStorage in useEffect
    return (defaultTheme || systemTheme || "light") as Theme;
  });

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(storageKey);
        if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
          setThemeState(savedTheme as Theme);
        } else if (defaultTheme) {
          setThemeState(defaultTheme);
          await AsyncStorage.setItem(storageKey, defaultTheme);
        } else if (systemTheme) {
          setThemeState(systemTheme as Theme);
          await AsyncStorage.setItem(storageKey, systemTheme);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
        setThemeState((defaultTheme || systemTheme || "light") as Theme);
      }
    };
    loadTheme();
  }, [defaultTheme, systemTheme, storageKey]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(storageKey, newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === "dark",
  };

  return (
    <ThemeContext.Provider value={value} {...props}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
}
