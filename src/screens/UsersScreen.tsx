import React, { useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { useApp } from "../context/AppContext";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { SearchBar } from "../components/SearchBar";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { Employee, EmployeeRole } from "../data/mockData";
import { RootStackParamList } from "../navigation/types";

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

const initials = (name: string) =>
  name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();

export const UsersScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { employees, currentUser, approveEmployee, rejectEmployee } = useApp();
  const [query, setQuery] = useState("");

  const isOwnerOrAdmin = currentUser?.role === "owner" || currentUser?.role === "admin";

  const pendingEmployees = useMemo(
    () => (isOwnerOrAdmin ? employees.filter((e) => e.status === "pending") : []),
    [employees, isOwnerOrAdmin]
  );

  const mainEmployees = useMemo(() => {
    const nonPending = employees.filter((e) => e.status !== "pending");
    if (!query.trim()) return nonPending;
    const q = query.toLowerCase();
    return nonPending.filter(
      (e) => e.name.toLowerCase().includes(q) || e.role.includes(q) || e.branch.toLowerCase().includes(q)
    );
  }, [employees, query]);

  const activeCount = employees.filter((e) => e.status === "active").length;

  const handleApprove = (emp: Employee) => {
    Alert.alert(
      "Approve Account",
      `Approve ${emp.name} as ${ROLE_LABEL[emp.role]}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            try {
              await approveEmployee(emp.id);
            } catch (err: unknown) {
              Alert.alert("Error", err instanceof Error ? err.message : "Failed to approve.");
            }
          },
        },
      ]
    );
  };

  const handleReject = (emp: Employee) => {
    Alert.alert(
      "Reject Request",
      `Reject and remove ${emp.name}'s account request?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              await rejectEmployee(emp.id);
            } catch (err: unknown) {
              Alert.alert("Error", err instanceof Error ? err.message : "Failed to reject.");
            }
          },
        },
      ]
    );
  };

  const renderPendingCard = ({ item }: { item: Employee }) => {
    const roleColor = ROLE_COLORS[item.role];
    return (
      <Card
        sheen
        style={[
          styles.pendingCard,
          {
            borderColor: theme.colors.warning,
            borderWidth: 1,
            borderRadius: theme.radius.lg,
          },
        ]}
      >
        <View style={styles.pendingTop}>
          <View style={[styles.avatar, { backgroundColor: `${roleColor}20`, borderRadius: theme.radius.pill }]}>
            <Text style={[styles.avatarText, { color: roleColor }]}>{initials(item.name)}</Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.metaRow}>
              <View style={[styles.roleBadge, { backgroundColor: `${roleColor}18`, borderRadius: theme.radius.pill }]}>
                <Text style={[styles.roleText, { color: roleColor }]}>{ROLE_LABEL[item.role]}</Text>
              </View>
              <Text style={[styles.branch, { color: theme.colors.textFaint }]}>· {item.branch}</Text>
            </View>
            <Text style={[styles.emailMeta, { color: theme.colors.textFaint }]}>{item.email}</Text>
          </View>
        </View>
        <View style={[styles.pendingActions, { borderTopColor: theme.colors.border }]}>
          <AnimatedPressable
            scaleTo={0.96}
            onPress={() => handleReject(item)}
            style={[styles.actionBtn, { backgroundColor: `${theme.colors.danger}12`, borderRadius: theme.radius.md }]}
          >
            <Ionicons name="close" size={15} color={theme.colors.danger} />
            <Text style={[styles.actionText, { color: theme.colors.danger }]}>Reject</Text>
          </AnimatedPressable>
          <AnimatedPressable
            scaleTo={0.96}
            onPress={() => handleApprove(item)}
            style={[styles.actionBtn, { backgroundColor: `${theme.colors.success}18`, borderRadius: theme.radius.md, flex: 1 }]}
          >
            <Ionicons name="checkmark" size={15} color={theme.colors.success} />
            <Text style={[styles.actionText, { color: theme.colors.success }]}>Approve</Text>
          </AnimatedPressable>
        </View>
      </Card>
    );
  };

  const renderEmployee = ({ item }: { item: Employee }) => {
    const roleColor = ROLE_COLORS[item.role];
    const isInactive = item.status === "inactive";
    return (
      <AnimatedPressable
        onPress={() => navigation.navigate("UserDetail", { userId: item.id })}
        scaleTo={0.98}
      >
        <Card sheen style={[styles.card, isInactive && { opacity: 0.6 }]}>
          <View style={[styles.avatar, { backgroundColor: `${roleColor}20`, borderRadius: theme.radius.pill }]}>
            <Text style={[styles.avatarText, { color: roleColor }]}>{initials(item.name)}</Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.metaRow}>
              <View style={[styles.roleBadge, { backgroundColor: `${roleColor}18`, borderRadius: theme.radius.pill }]}>
                <Text style={[styles.roleText, { color: roleColor }]}>{ROLE_LABEL[item.role]}</Text>
              </View>
              <Text style={[styles.branch, { color: theme.colors.textFaint }]}>· {item.branch}</Text>
            </View>
          </View>
          <View style={styles.right}>
            {isInactive && (
              <View style={[styles.inactiveBadge, { backgroundColor: `${theme.colors.danger}18`, borderRadius: theme.radius.pill }]}>
                <Text style={[styles.inactiveText, { color: theme.colors.danger }]}>Inactive</Text>
              </View>
            )}
            {item.carsSold > 0 && (
              <Text style={[styles.sold, { color: theme.colors.textMuted }]}>
                {item.carsSold} sold
              </Text>
            )}
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textFaint} />
          </View>
        </Card>
      </AnimatedPressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <View style={[styles.headerSection, { gap: theme.spacing(3) }]}>
        <View style={styles.titleRow}>
          <AnimatedPressable onPress={() => navigation.goBack()} scaleTo={0.9} haptic={false}>
            <View style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
            </View>
          </AnimatedPressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Team</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              {activeCount} active · {employees.filter((e) => e.status !== "pending").length} total
            </Text>
          </View>
          <Button
            label="+ Add"
            style={{ paddingVertical: 8, paddingHorizontal: 14 }}
            onPress={() => navigation.navigate("AddEmployee")}
          />
        </View>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search by name, role…" />
      </View>

      <FlatList
        data={mainEmployees}
        keyExtractor={(item) => item.id}
        renderItem={renderEmployee}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={
          pendingEmployees.length > 0 ? (
            <View style={{ marginBottom: 20 }}>
              {/* Pending section header */}
              <View style={[styles.sectionHeader, { borderRadius: theme.radius.md, backgroundColor: `${theme.colors.warning}14` }]}>
                <View style={styles.sectionHeaderLeft}>
                  <Ionicons name="time-outline" size={16} color={theme.colors.warning} />
                  <Text style={[styles.sectionHeaderText, { color: theme.colors.warning }]}>
                    Pending Approval
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: theme.colors.warning }]}>
                  <Text style={styles.badgeText}>{pendingEmployees.length}</Text>
                </View>
              </View>
              <View style={{ gap: 10, marginTop: 10 }}>
                {pendingEmployees.map((emp) => (
                  <View key={emp.id}>{renderPendingCard({ item: emp })}</View>
                ))}
              </View>
              {/* Divider before main list */}
              <View style={[styles.divider, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.dividerText, { color: theme.colors.textFaint }]}>Active Team Members</Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={28} color={theme.colors.textFaint} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>No employees found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerSection: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 14 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  subtitle: { fontSize: 12.5, marginTop: 1 },
  list: { paddingHorizontal: 18, paddingBottom: 32 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 7 },
  sectionHeaderText: { fontSize: 13.5, fontWeight: "700" },
  badge: { borderRadius: 10, minWidth: 20, paddingHorizontal: 6, paddingVertical: 2, alignItems: "center" },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  pendingCard: { padding: 14, gap: 12 },
  pendingTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  pendingActions: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  actionText: { fontSize: 13.5, fontWeight: "700" },
  divider: { borderBottomWidth: 1, paddingBottom: 12, marginTop: 16, alignItems: "center" },
  dividerText: { fontSize: 12, fontWeight: "600", backgroundColor: "transparent", marginBottom: -7 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  avatar: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 15, fontWeight: "700" },
  info: { flex: 1, gap: 4 },
  name: { fontSize: 15, fontWeight: "700" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3 },
  roleText: { fontSize: 11.5, fontWeight: "600" },
  branch: { fontSize: 12 },
  emailMeta: { fontSize: 11.5, marginTop: 1 },
  right: { alignItems: "flex-end", gap: 4 },
  inactiveBadge: { paddingHorizontal: 7, paddingVertical: 3 },
  inactiveText: { fontSize: 11, fontWeight: "700" },
  sold: { fontSize: 11.5 },
  empty: { alignItems: "center", gap: 10, paddingTop: 80 },
});
