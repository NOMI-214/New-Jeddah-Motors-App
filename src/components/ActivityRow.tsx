import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { AnimatedPressable } from "./AnimatedPressable";

type ActivityType = "sale" | "cashIn" | "cashOut" | "update";

interface ActivityRowProps {
  title: string;
  subtitle: string;
  time: string;
  type: ActivityType;
  isLast?: boolean;
  onPress?: () => void;
}

const iconFor: Record<ActivityType, keyof typeof Ionicons.glyphMap> = {
  sale: "car-sport",
  cashIn: "arrow-down-circle",
  cashOut: "arrow-up-circle",
  update: "refresh-circle",
};

export const ActivityRow: React.FC<ActivityRowProps> = ({ title, subtitle, time, type, isLast, onPress }) => {
  const theme = useTheme();

  const toneColor = {
    sale: theme.colors.accent,
    cashIn: theme.colors.success,
    cashOut: theme.colors.danger,
    update: theme.colors.steel,
  }[type];

  const inner = (
    <View
      style={[
        styles.row,
        !isLast && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${toneColor}1F`, borderRadius: theme.radius.pill }]}>
        <Ionicons name={iconFor[type]} size={16} color={toneColor} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Text style={[styles.time, { color: theme.colors.textFaint }]}>{time}</Text>
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable onPress={onPress} scaleTo={0.98} haptic={false}>
        {inner}
      </AnimatedPressable>
    );
  }

  return inner;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14.5,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12.5,
  },
  time: {
    fontSize: 11.5,
  },
});
