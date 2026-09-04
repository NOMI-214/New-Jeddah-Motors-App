import React from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { useApp } from "../context/AppContext";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { EmployeeRole } from "../data/mockData";
import { RootStackParamList } from "../navigation/types";
import { resetUserPassword } from "../api";

const ROLE_COLORS: Record<EmployeeRole, string> = {
  owner: "#C9A961",
  manager: "#6E93B5",
  accountant: "#4D9D6F",
  salesperson: "#A37FC0",
  admin: "#D2685D",
};

const ROLE_LABEL: Record<EmployeeRole, string> = {
  owner: "Owner",
  manager: "Manager",
  accountant: "Accountant",
  salesperson: "Salesperson",
  admin: "Admin",
};

const Row: React.FC<{ icon: keyof typeof Ionicons.glyphMap; label: string; value: string }> = ({
  icon, label, value,
}) => {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={16} color={theme.colors.textMuted} style={{ width: 22 }} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: theme.colors.textMuted }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: theme.colors.text }]}>{value}</Text>
      </View>
    </View>
  );
};

export const UserDetailScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "UserDetail">>();
  const { employees, toggleEmployeeStatus, approveEmployee, rejectEmployee, currentUser } = useApp();

  const employee = employees.find((e) => String(e.id) === route.params.userId);
  const employeeNumId = employee ? Number(employee.id) : 0;

  if (!employee) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: theme.colors.textMuted }}>Employee not found</Text>
      </SafeAreaView>
    );
  }

  const roleColor = ROLE_COLORS[employee.role];
  const initials = employee.name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  const isInactive = employee.status === "inactive";
  const isPending = employee.status === "pending";
  const isOwnerOrAdmin = currentUser?.role === "owner" || currentUser?.role === "admin";

  const handleToggle = () => {
    const action = isInactive ? "activate" : "deactivate";
    Alert.alert(
      `${isInactive ? "Activate" : "Deactivate"} employee?`,
      `Are you sure you want to ${action} ${employee.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isInactive ? "Activate" : "Deactivate",
          style: isInactive ? "default" : "destructive",
          onPress: async () => {
            try {
              await toggleEmployeeStatus(employee.id);
            } catch (err: unknown) {
              Alert.alert("Error", err instanceof Error ? err.message : "Failed to update status.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <AnimatedPressable onPress={() => navigation.goBack()} scaleTo={0.9} haptic={false}>
          <View style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </View>
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {employee.name}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <Card sheen style={styles.hero}>
          <View style={[styles.avatar, { backgroundColor: `${roleColor}20`, borderRadius: theme.radius.pill }]}>
            <Text style={[styles.avatarText, { color: roleColor }]}>{initials}</Text>
          </View>
          <Text style={[styles.heroName, { color: theme.colors.text }]}>{employee.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: `${roleColor}18`, borderRadius: theme.radius.pill }]}>
            <Text style={[styles.roleText, { color: roleColor }]}>{ROLE_LABEL[employee.role]}</Text>
          </View>
          {isInactive && (
            <View style={[styles.inactiveBadge, { backgroundColor: `${theme.colors.danger}18`, borderRadius: theme.radius.pill }]}>
              <Text style={[styles.inactiveText, { color: theme.colors.danger }]}>Inactive</Text>
            </View>
          )}
          {isPending && (
            <View style={[styles.inactiveBadge, { backgroundColor: `${theme.colors.warning}18`, borderRadius: theme.radius.pill }]}>
              <Text style={[styles.inactiveText, { color: theme.colors.warning }]}>Pending Approval</Text>
            </View>
          )}
        </Card>

        {/* Performance */}
        {(employee.carsSold > 0 || employee.role === "salesperson" || employee.role === "manager") && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Performance</Text>
            <View style={styles.perfRow}>
              <Card sheen style={styles.perfCard}>
                <Text style={[styles.perfValue, { color: theme.colors.text }]}>{employee.carsSold}</Text>
                <Text style={[styles.perfLabel, { color: theme.colors.textMuted }]}>Cars Sold</Text>
              </Card>
              <Card sheen style={styles.perfCard}>
                <Text style={[styles.perfValue, { color: theme.colors.accent }]}>{employee.revenueGenerated}</Text>
                <Text style={[styles.perfLabel, { color: theme.colors.textMuted }]}>Revenue</Text>
              </Card>
            </View>
          </View>
        )}

        {/* Contact details */}
        <View>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Details</Text>
          <Card sheen padded={false} style={{ paddingHorizontal: theme.spacing(4) }}>
            <Row icon="mail-outline" label="Email" value={employee.email} />
            <Row icon="call-outline" label="Phone" value={employee.phone} />
            <Row icon="business-outline" label="Branch" value={employee.branch} />
            <Row icon="location-outline" label="Address" value={employee.address} />
            <Row icon="calendar-outline" label="Joined" value={employee.joinDate} />
          </Card>
        </View>

        {/* Action — pending approval */}
        {isPending && isOwnerOrAdmin && (
          <View style={{ gap: 10 }}>
            <Card sheen style={[styles.pendingBanner, { borderColor: theme.colors.warning }]}>
              <Ionicons name="time-outline" size={18} color={theme.colors.warning} />
              <Text style={[styles.pendingBannerText, { color: theme.colors.warning }]}>
                This account is awaiting your approval
              </Text>
            </Card>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button
                label="Reject"
                variant="ghost"
                style={{ flex: 1 }}
                onPress={() =>
                  Alert.alert("Reject Request", `Remove ${employee.name}'s account request?`, [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Reject",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await rejectEmployee(employee.id);
                          navigation.goBack();
                        } catch (err: unknown) {
                          Alert.alert("Error", err instanceof Error ? err.message : "Failed.");
                        }
                      },
                    },
                  ])
                }
              />
              <Button
                label="Approve"
                style={{ flex: 1 }}
                onPress={() =>
                  Alert.alert("Approve Account", `Approve ${employee.name} as ${ROLE_LABEL[employee.role]}?`, [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Approve",
                      onPress: async () => {
                        try {
                          await approveEmployee(employee.id);
                          navigation.goBack();
                        } catch (err: unknown) {
                          Alert.alert("Error", err instanceof Error ? err.message : "Failed.");
                        }
                      },
                    },
                  ])
                }
              />
            </View>
          </View>
        )}

        {/* Action — active/inactive toggle + reset password */}
        {!isPending && isOwnerOrAdmin && (
          <View style={{ gap: 10 }}>
            <Button
              label={isInactive ? "Activate Account" : "Deactivate Account"}
              variant={isInactive ? "secondary" : "ghost"}
              onPress={handleToggle}
            />
            <Button
              label="Reset Password"
              variant="ghost"
              onPress={() =>
                Alert.alert(
                  "Reset Password",
                  `Set a new temporary password for ${employee.name}.\n\nThey should change it after logging in.`,
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Reset to 'demo1234'",
                      onPress: async () => {
                        try {
                          await resetUserPassword(employeeNumId, "demo1234");
                          Alert.alert("Done", `Password reset to "demo1234" for ${employee.name}.`);
                        } catch (err: unknown) {
                          Alert.alert("Error", err instanceof Error ? err.message : "Failed.");
                        }
                      },
                    },
                  ]
                )
              }
            />
          </View>
        )}
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
  headerTitle: { fontSize: 16, fontWeight: "700", flex: 1, textAlign: "center", marginHorizontal: 8 },
  content: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 40, gap: 20 },
  hero: { alignItems: "center", gap: 8, paddingVertical: 26 },
  avatar: { width: 72, height: 72, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  avatarText: { fontSize: 22, fontWeight: "700" },
  heroName: { fontSize: 19, fontWeight: "700" },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 5 },
  roleText: { fontSize: 12.5, fontWeight: "700" },
  inactiveBadge: { paddingHorizontal: 10, paddingVertical: 4 },
  inactiveText: { fontSize: 12, fontWeight: "700" },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
  perfRow: { flexDirection: "row", gap: 10 },
  perfCard: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 16 },
  perfValue: { fontSize: 18, fontWeight: "700" },
  perfLabel: { fontSize: 12, fontWeight: "500" },
  row: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 12, gap: 6 },
  rowLabel: { fontSize: 12, marginBottom: 2 },
  rowValue: { fontSize: 14, fontWeight: "600" },
  pendingBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderWidth: 1 },
  pendingBannerText: { fontSize: 13.5, fontWeight: "600", flex: 1 },
});
