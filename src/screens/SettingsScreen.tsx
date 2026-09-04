import React from "react";
import { View, Text, ScrollView, StyleSheet, Alert, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useThemeContext } from "../theme/ThemeProvider";
import { useApp } from "../context/AppContext";
import { Card } from "../components/Card";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { Button } from "../components/Button";
import { RootStackParamList } from "../navigation/types";

const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
  const theme = useTheme();
  return (
    <Text style={[styles.sectionHeader, { color: theme.colors.textMuted }]}>{title}</Text>
  );
};

const SettingRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  isLast?: boolean;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}> = ({ icon, label, value, isLast, onPress, rightElement, destructive }) => {
  const theme = useTheme();
  return (
    <AnimatedPressable
      onPress={onPress}
      scaleTo={onPress ? 0.98 : 1}
      haptic={false}
      style={
      !isLast
        ? [styles.settingRow, { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]
        : styles.settingRow
    }
    >
      <View style={[styles.settingIcon, { backgroundColor: theme.colors.surfaceRaised, borderRadius: theme.radius.sm }]}>
        <Ionicons name={icon} size={17} color={destructive ? theme.colors.danger : theme.colors.accent} />
      </View>
      <Text style={[styles.settingLabel, { color: destructive ? theme.colors.danger : theme.colors.text }]}>
        {label}
      </Text>
      {value && <Text style={[styles.settingValue, { color: theme.colors.textMuted }]}>{value}</Text>}
      {rightElement}
      {onPress && !rightElement && (
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textFaint} />
      )}
    </AnimatedPressable>
  );
};

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const { mode, manualMode, setManualMode } = useThemeContext();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currentUser, logout } = useApp();

  const handleLogout = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: logout },
    ]);
  };

  const themeOptions: { label: string; value: null | "light" | "dark" }[] = [
    { label: "System", value: null },
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <AnimatedPressable onPress={() => navigation.goBack()} scaleTo={0.9} haptic={false}>
          <View style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </View>
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        {currentUser && (
          <Card sheen style={styles.profileCard}>
            <View style={[styles.profileAvatar, { backgroundColor: theme.colors.accentMuted, borderRadius: theme.radius.pill }]}>
              <Text style={[styles.profileAvatarText, { color: theme.colors.accent }]}>
                {currentUser.name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>{currentUser.name}</Text>
              <Text style={[styles.profileEmail, { color: theme.colors.textMuted }]}>{currentUser.email}</Text>
              <View style={[styles.roleBadge, { backgroundColor: theme.colors.accentMuted, borderRadius: theme.radius.pill }]}>
                <Text style={[styles.roleText, { color: theme.colors.accent }]}>
                  {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} · {currentUser.branch}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Appearance */}
        <View>
          <SectionHeader title="APPEARANCE" />
          <Card sheen style={{ gap: 0 }} padded={false}>
            <View style={styles.themePicker}>
              <Text style={[styles.themeLabel, { color: theme.colors.text }]}>Theme</Text>
              <View style={styles.themeOptions}>
                {themeOptions.map((opt) => {
                  const isActive = (manualMode ?? null) === opt.value;
                  return (
                    <AnimatedPressable
                      key={opt.label}
                      onPress={() => setManualMode(opt.value)}
                      scaleTo={0.95}
                      style={[
                        styles.themeOption,
                        {
                          backgroundColor: isActive ? theme.colors.accent : theme.colors.surfaceRaised,
                          borderRadius: theme.radius.pill,
                        },
                      ]}
                    >
                      <Text style={[styles.themeOptionText, { color: isActive ? (mode === "dark" ? "#0B0D10" : "#FFF") : theme.colors.textMuted }]}>
                        {opt.label}
                      </Text>
                    </AnimatedPressable>
                  );
                })}
              </View>
            </View>
          </Card>
        </View>

        {/* App info */}
        <View>
          <SectionHeader title="APP INFO" />
          <Card sheen padded={false} style={{ paddingHorizontal: theme.spacing(4) }}>
            <SettingRow icon="business-outline" label="Showroom" value="New Jeddah Motors" />
            <SettingRow icon="git-branch-outline" label="Version" value="1.0.0 (Demo)" />
            <SettingRow icon="server-outline" label="Data" value="Local (Mock)" isLast />
          </Card>
        </View>

        {/* Account */}
        <View>
          <SectionHeader title="ACCOUNT" />
          <Card sheen padded={false} style={{ paddingHorizontal: theme.spacing(4) }}>
            <SettingRow icon="lock-closed-outline" label="Change Password" onPress={() => navigation.navigate("ChangePassword")} />
            <SettingRow icon="log-out-outline" label="Sign Out" destructive onPress={handleLogout} isLast />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  content: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 40, gap: 20 },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 14 },
  profileAvatar: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },
  profileAvatarText: { fontSize: 18, fontWeight: "700" },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 16, fontWeight: "700" },
  profileEmail: { fontSize: 13 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  roleText: { fontSize: 12, fontWeight: "600" },
  sectionHeader: { fontSize: 11.5, fontWeight: "700", letterSpacing: 0.8, marginBottom: 8 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingIcon: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  settingLabel: { flex: 1, fontSize: 14.5, fontWeight: "500" },
  settingValue: { fontSize: 13.5 },
  themePicker: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  themeLabel: { flex: 1, fontSize: 14.5, fontWeight: "500" },
  themeOptions: { flexDirection: "row", gap: 6 },
  themeOption: { paddingHorizontal: 12, paddingVertical: 6 },
  themeOptionText: { fontSize: 13, fontWeight: "600" },
});
