import { DarkTheme, DefaultTheme, Theme as NavTheme } from "@react-navigation/native";
import { Theme } from "./tokens";

export function toNavigationTheme(theme: Theme): NavTheme {
  const base = theme.mode === "dark" ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark: theme.mode === "dark",
    colors: {
      ...base.colors,
      primary: theme.colors.accent,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
  };
}
