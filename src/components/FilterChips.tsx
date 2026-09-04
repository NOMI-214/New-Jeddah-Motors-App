import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { AnimatedPressable } from "./AnimatedPressable";

interface FilterChipsProps<T extends string> {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}

export function FilterChips<T extends string>({ options, selected, onSelect }: FilterChipsProps<T>) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map((opt) => {
        const isActive = opt.value === selected;
        return (
          <AnimatedPressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            scaleTo={0.95}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? theme.colors.accent : theme.colors.surface,
                borderColor: isActive ? theme.colors.accent : theme.colors.border,
                borderRadius: theme.radius.pill,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? (theme.mode === "dark" ? "#0B0D10" : "#FFFFFF") : theme.colors.textMuted },
              ]}
            >
              {opt.label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
  },
  label: {
    fontSize: 13.5,
    fontWeight: "600",
  },
});
