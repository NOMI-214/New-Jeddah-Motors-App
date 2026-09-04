import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { useApp } from "../context/AppContext";
import { Card } from "../components/Card";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { RootStackParamList } from "../navigation/types";

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  badge?: string | number;
  badgeColor?: string;
  onPress: () => void;
}

export const MoreScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currentUser, sales, installments, employees, auditLogs } = useApp();

  const overdueInstallments = installments.filter((i) => i.status === "overdue").length;
  const initials = currentUser?.name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase() ?? "?";

  const menuGroups: { title: string; items: MenuItem[] }[] = [
    {
      title: "Operations",
      items: [
        {
          icon: "cart-outline",
          label: "Sales",
          subtitle: `${sales.length} total sale${sales.length !== 1 ? "s" : ""}`,
          onPress: () => navigation.navigate("Sales"),
        },
        {
          icon: "time-outline",
          label: "Installments",
          subtitle: "Track payment plans",
          badge: overdueInstallments > 0 ? overdueInstallments : undefined,
          badgeColor: theme.colors.danger,
          onPress: () => navigation.navigate("Installments"),
        },
      ],
    },
    {
      title: "People",
      items: [
        {
          icon: "people-outline",
          label: "Team",
          subtitle: `${employees.filter((e) => e.status === "active").length} active employees`,
          onPress: () => navigation.navigate("Users"),
        },
      ],
    },
    {
      title: "Analytics",
      items: [
        {
          icon: "bar-chart-outline",
          label: "Reports",
          subtitle: "Revenue, expenses, profit trends",
          onPress: () => navigation.navigate("Reports"),
        },
        {
          icon: "document-text-outline",
          label: "Audit Logs",
          subtitle: `${auditLogs.length} activity entries`,
          onPress: () => navigation.navigate("AuditLogs"),
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          icon: "settings-outline",
          label: "Settings",
          subtitle: "Theme, account, preferences",
          onPress: () => navigation.navigate("Settings"),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User header */}
        {currentUser && (
          <View style={styles.userHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.accentMuted, borderRadius: theme.radius.pill }]}>
              <Text style={[styles.avatarText, { color: theme.colors.accent }]}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.userName, { color: theme.colors.text }]}>{currentUser.name}</Text>
              <Text style={[styles.userRole, { color: theme.colors.textMuted }]}>
                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} · {currentUser.branch}
              </Text>
            </View>
          </View>
        )}

        {/* Menu groups */}
        {menuGroups.map((group) => (
          <View key={group.title} style={{ gap: 8 }}>
            <Text style={[styles.groupTitle, { color: theme.colors.textMuted }]}>{group.title.toUpperCase()}</Text>
            <Card sheen padded={false}>
              {group.items.map((item, idx) => (
                <AnimatedPressable
                  key={item.label}
                  onPress={item.onPress}
                  scaleTo={0.98}
                  style={[
                    styles.menuRow,
                    ...(idx < group.items.length - 1 ? [{ borderBottomWidth: 1, borderBottomColor: theme.colors.border } as const] : []),
                  ]}
                >
                  <View style={[styles.menuIcon, { backgroundColor: theme.colors.accentMuted, borderRadius: theme.radius.md }]}>
                    <Ionicons name={item.icon} size={19} color={theme.colors.accent} />
                  </View>
                  <View style={styles.menuText}>
                    <Text style={[styles.menuLabel, { color: theme.colors.text }]}>{item.label}</Text>
                    <Text style={[styles.menuSub, { color: theme.colors.textMuted }]}>{item.subtitle}</Text>
                  </View>
                  {item.badge !== undefined && (
                    <View style={[styles.badge, { backgroundColor: item.badgeColor ?? theme.colors.danger }]}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textFaint} />
                </AnimatedPressable>
              ))}
            </Card>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 40, gap: 20 },
  userHeader: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 4 },
  avatar: { width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 17, fontWeight: "700" },
  userName: { fontSize: 17, fontWeight: "700" },
  userRole: { fontSize: 13, marginTop: 2 },
  groupTitle: { fontSize: 11.5, fontWeight: "700", letterSpacing: 0.8 },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  menuIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  menuText: { flex: 1, gap: 2 },
  menuLabel: { fontSize: 15, fontWeight: "600" },
  menuSub: { fontSize: 12.5 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
});
