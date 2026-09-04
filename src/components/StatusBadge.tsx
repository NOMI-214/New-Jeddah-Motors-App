import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { CarStatus } from "../data/mockData";

interface BadgeProps {
  status: CarStatus;
}

const labelFor: Record<CarStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

export const StatusBadge: React.FC<BadgeProps> = ({ status }) => {
  const theme = useTheme();

  const color = {
    available: theme.colors.success,
    reserved: theme.colors.warning,
    sold: theme.colors.textFaint,
  }[status];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${color}1F`,
          borderRadius: theme.radius.pill,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{labelFor[status]}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 9,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11.5,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});
