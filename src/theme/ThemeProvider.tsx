import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { Theme, ThemeMode, darkTheme, lightTheme } from "./tokens";

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  manualMode: ThemeMode | null;
  setManualMode: (mode: ThemeMode | null) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: darkTheme,
  mode: "dark",
  manualMode: null,
  setManualMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scheme, setScheme] = useState<ColorSchemeName>(Appearance.getColorScheme() ?? "dark");
  const [manualMode, setManualMode] = useState<ThemeMode | null>(null);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  const resolvedMode: ThemeMode = manualMode ?? (scheme === "light" ? "light" : "dark");
  const theme = resolvedMode === "light" ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, mode: resolvedMode, manualMode, setManualMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext).theme;
export const useThemeContext = () => useContext(ThemeContext);
