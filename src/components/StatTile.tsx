import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Card } from "./Card";
import { AnimatedPressable } from "./AnimatedPressable";
import { Ionicons } from "@expo/vector-icons";

interface StatTileProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  trend?: { direction: "up" | "down"; value: string };
  tone?: "neutral" | "accent" | "success" | "danger";
  onPress?: () => void;
}

export const StatTile: React.FC<StatTileProps> = ({ label, value, icon, trend, tone = "neutral", onPress }) => {
  const theme = useTheme();

  const toneColor = {
    neutral: theme.colors.text,
    accent: theme.colors.accent,
    success: theme.colors.success,
    danger: theme.colors.danger,
  }[tone];

  const iconBg = {
    neutral: theme.colors.surfaceRaised,
    accent: theme.colors.accentMuted,
    success: `${theme.colors.success}1F`,
    danger: `${theme.colors.danger}1F`,
  }[tone];

  const content = (
    <Card sheen style={styles.tile} padded>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: iconBg, borderRadius: theme.radius.md }]}>
          <Ionicons name={icon} size={18} color={toneColor} />
        </View>
        {trend && (
          <View style={styles.trendRow}>
            <Ionicons
              name={trend.direction === "up" ? "trending-up" : "trending-down"}
              size={14}
              color={trend.direction === "up" ? theme.colors.success : theme.colors.danger}
            />
            <Text
              style={[
                styles.trendText,
                { color: trend.direction === "up" ? theme.colors.success : theme.colors.danger },
              ]}
            >
              {trend.value}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.value, { color: theme.colors.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.label, { color: theme.colors.textMuted }]} numberOfLines={1}>
        {label}
      </Text>
    </Card>
  );

  if (onPress) {
    return (
      <AnimatedPressable onPress={onPress} scaleTo={0.97} style={styles.tile}>
        <Card sheen padded>
          <View style={styles.headerRow}>
            <View style={[styles.iconWrap, { backgroundColor: iconBg, borderRadius: theme.radius.md }]}>
              <Ionicons name={icon} size={18} color={toneColor} />
            </View>
            {trend && (
              <View style={styles.trendRow}>
                <Ionicons
                  name={trend.direction === "up" ? "trending-up" : "trending-down"}
                  size={14}
                  color={trend.direction === "up" ? theme.colors.success : theme.colors.danger}
                />
                <Text
                  style={[
                    styles.trendText,
                    { color: trend.direction === "up" ? theme.colors.success : theme.colors.danger },
                  ]}
                >
                  {trend.value}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.value, { color: theme.colors.text }]} numberOfLines={1}>
            {value}
          </Text>
          <Text style={[styles.label, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {label}
          </Text>
        </Card>
      </AnimatedPressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  tile: {
    flexBasis: "47%",
    flexGrow: 1,
    minWidth: 150,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconWrap: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 12.5,
    fontWeight: "500",
  },
});
