// Design tokens for the Car Showroom app.
// Mood: "showroom at night" — dark, metallic, premium.
// Light mode mirrors the same brand accent for continuity, on a clean,
// bright surface for daytime / outdoor use.

export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string; // brushed gold — brand, used sparingly
  accentMuted: string; // low-opacity gold for backgrounds/badges
  steel: string; // secondary accent — charts, links, info
  success: string;
  warning: string;
  danger: string;
  overlay: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: (multiplier: number) => number;
  radius: { sm: number; md: number; lg: number; xl: number; pill: number };
  font: {
    display: string;
    body: string;
  };
}

const darkColors: ThemeColors = {
  background: "#0B0D10",
  surface: "#15181C",
  surfaceRaised: "#1C2025",
  border: "#262B31",
  borderStrong: "#34393F",
  text: "#EDEEF0",
  textMuted: "#9AA1AC",
  textFaint: "#5C636D",
  accent: "#C9A961",
  accentMuted: "rgba(201, 169, 97, 0.16)",
  steel: "#6E93B5",
  success: "#4D9D6F",
  warning: "#D4A24C",
  danger: "#D2685D",
  overlay: "rgba(0, 0, 0, 0.6)",
};

const lightColors: ThemeColors = {
  background: "#F6F6F4",
  surface: "#FFFFFF",
  surfaceRaised: "#FFFFFF",
  border: "#E6E4DF",
  borderStrong: "#D4D1C9",
  text: "#1A1C1F",
  textMuted: "#646A73",
  textFaint: "#9CA1A8",
  accent: "#A8843F",
  accentMuted: "rgba(168, 132, 63, 0.12)",
  steel: "#3E5C76",
  success: "#3D8A5C",
  warning: "#B8862F",
  danger: "#BC4A3F",
  overlay: "rgba(0, 0, 0, 0.4)",
};

const spacing = (multiplier: number) => multiplier * 4;

const radius = { sm: 6, md: 10, lg: 16, xl: 24, pill: 999 };

const font = {
  // System fonts for now — see README for swapping in a custom display face.
  display: "System",
  body: "System",
};

export const darkTheme: Theme = { mode: "dark", colors: darkColors, spacing, radius, font };
export const lightTheme: Theme = { mode: "light", colors: lightColors, spacing, radius, font };
