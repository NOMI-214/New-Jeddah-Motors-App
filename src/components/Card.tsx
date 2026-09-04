import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { MetallicSheen } from "./MetallicSheen";

interface CardProps extends ViewProps {
  sheen?: boolean;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({ style, sheen = false, padded = true, children, ...rest }) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          padding: padded ? theme.spacing(4) : 0,
        },
        style,
      ]}
      {...rest}
    >
      {sheen && (
        <MetallicSheen
          style={{
            position: "absolute",
            top: 0,
            left: theme.radius.lg,
            right: theme.radius.lg,
          }}
        />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: "hidden",
  },
});
