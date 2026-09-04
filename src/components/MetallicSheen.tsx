import React from "react";
import { ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme/ThemeProvider";

interface Props {
  style?: ViewStyle;
  height?: number;
  horizontal?: boolean;
}

/**
 * A thin gold-to-transparent gradient line — the app's signature motif.
 * References chrome trim / showroom spotlighting without being literal.
 * Use sparingly: card top edges, active tab indicator, section dividers.
 */
export const MetallicSheen: React.FC<Props> = ({ style, height = 2, horizontal = true }) => {
  const theme = useTheme();
  return (
    <LinearGradient
      colors={[theme.colors.accent, `${theme.colors.accent}00`]}
      start={horizontal ? { x: 0, y: 0 } : { x: 0, y: 0 }}
      end={horizontal ? { x: 1, y: 0 } : { x: 0, y: 1 }}
      style={[
        horizontal ? { height, width: "100%" } : { width: height, height: "100%" },
        style,
      ]}
    />
  );
};
