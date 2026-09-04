import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { useApp } from "../context/AppContext";
import { StatTile } from "../components/StatTile";
import { Card } from "../components/Card";
import { ActivityRow } from "../components/ActivityRow";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { TabParamList, RootStackParamList } from "../navigation/types";

type DashboardNav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Dashboard">,
  NativeStackNavigationProp<RootStackParamList>
>;

export const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<DashboardNav>();
  const { cars, customers, transactions, expenses, sales, auditLogs, currentUser } = useApp();

  const cashInToday = transactions
    .filter((t) => t.type === "cashIn" && t.date === "Today")
    .reduce((s, t) => s + t.amountNum, 0);

  const cashOutToday = transactions
    .filter((t) => t.type === "cashOut" && t.date === "Today")
    .reduce((s, t) => s + t.amountNum, 0);

  const totalExpenses = expenses.reduce((s, e) => s + e.amountNum, 0);

  const totalCashIn = transactions
    .filter((t) => t.type === "cashIn")
    .reduce((s, t) => s + t.amountNum, 0);
  const totalCashOut = transactions
    .filter((t) => t.type === "cashOut")
    .reduce((s, t) => s + t.amountNum, 0);
  const balance = totalCashIn - totalCashOut - totalExpenses;

  const carsAvailable = cars.filter((c) => c.status === "available").length;
  const carsSold = cars.filter((c) => c.status === "sold").length;

  const pendingPayments = customers.reduce((s, c) => s + c.outstandingAmountNum, 0);

  const fmt = (n: number) => "Rs " + n.toLocaleString("en-PK");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const customersWithBalance = customers.filter((c) => c.outstandingAmountNum > 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[styles.content, { gap: theme.spacing(6) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: theme.colors.textMuted }]}>{greeting}</Text>
            <Text style={[styles.showroomName, { color: theme.colors.text }]}>
              {currentUser?.branch ?? "Islamabad"} Branch
            </Text>
          </View>
          <AnimatedPressable
            onPress={() => navigation.navigate("Settings")}
            scaleTo={0.9}
            haptic={false}
          >
            <View style={[styles.avatarWrap, { backgroundColor: theme.colors.accentMuted, borderRadius: theme.radius.pill }]}>
              <Text style={[styles.avatarText, { color: theme.colors.accent }]}>
                {currentUser?.name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase() ?? "?"}
              </Text>
            </View>
          </AnimatedPressable>
        </View>

        <View style={[styles.grid, { gap: theme.spacing(3) }]}>
          <StatTile
            label="Current balance"
            value={fmt(balance)}
            icon="wallet"
            tone="accent"
            onPress={() => navigation.navigate("Finance")}
          />
          <StatTile
            label="Cash in today"
            value={fmt(cashInToday)}
            icon="trending-up"
            tone="success"
            trend={cashInToday > 0 ? { direction: "up", value: "+today" } : undefined}
            onPress={() => navigation.navigate("Finance")}
          />
          <StatTile
            label="Cash out today"
            value={fmt(cashOutToday)}
            icon="trending-down"
            tone="danger"
            onPress={() => navigation.navigate("Finance")}
          />
          <StatTile
            label="Total expenses"
            value={fmt(totalExpenses)}
            icon="receipt"
            tone="neutral"
            onPress={() => navigation.navigate("Finance")}
          />
          <StatTile
            label="Cars available"
            value={String(carsAvailable)}
            icon="car-sport"
            tone="neutral"
            onPress={() => navigation.navigate("Cars")}
          />
          <StatTile
            label="Cars sold"
            value={String(carsSold)}
            icon="checkmark-circle"
            tone="success"
            onPress={() => navigation.navigate("Cars")}
          />
        </View>

        {/* Quick actions */}
        <View>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick actions</Text>
          <View style={styles.actionsRow}>
            {[
              { icon: "add-circle" as const, label: "Add Car", onPress: () => navigation.navigate("AddCar") },
              { icon: "person-add" as const, label: "Add Customer", onPress: () => navigation.navigate("AddCustomer") },
              { icon: "cash" as const, label: "Cash In", onPress: () => navigation.navigate("AddTransaction", { type: "cashIn" }) },
              { icon: "receipt" as const, label: "Expense", onPress: () => navigation.navigate("AddExpense") },
            ].map((action) => (
              <AnimatedPressable key={action.label} onPress={action.onPress} scaleTo={0.93}>
                <View style={[styles.actionItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
                  <View style={[styles.actionIcon, { backgroundColor: theme.colors.accentMuted, borderRadius: theme.radius.sm }]}>
                    <Ionicons name={action.icon} size={18} color={theme.colors.accent} />
                  </View>
                  <Text style={[styles.actionLabel, { color: theme.colors.text }]}>{action.label}</Text>
                </View>
              </AnimatedPressable>
            ))}
          </View>
        </View>

        {/* Recent audit logs */}
        <View>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent activity</Text>
          <Card sheen padded={false} style={{ paddingHorizontal: theme.spacing(4) }}>
            {auditLogs.slice(0, 4).map((log, index) => (
              <ActivityRow
                key={log.id}
                title={log.description}
                subtitle={`${log.module} · ${log.userName}`}
                time={log.timestamp}
                type={log.type === "create" ? "cashIn" : log.type === "delete" ? "cashOut" : "update"}
                isLast={index === Math.min(auditLogs.length, 4) - 1}
                onPress={() => navigation.navigate("AuditLogs")}
              />
            ))}
          </Card>
        </View>

        {/* Customers with balance due */}
        {customersWithBalance.length > 0 && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Outstanding payments</Text>
            <Card sheen padded={false} style={{ paddingHorizontal: theme.spacing(4) }}>
              {customersWithBalance.map((c, index, arr) => (
                <ActivityRow
                  key={c.id}
                  title={c.name}
                  subtitle={`Owes ${c.outstandingAmount}`}
                  time=""
                  type="update"
                  isLast={index === arr.length - 1}
                  onPress={() => navigation.navigate("CustomerDetail", { customerId: c.id })}
                />
              ))}
            </Card>
          </View>
        )}

        {/* Pending sales */}
        {sales.filter((s) => s.status === "pending").length > 0 && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pending sales</Text>
            <Card sheen padded={false} style={{ paddingHorizontal: theme.spacing(4) }}>
              {sales
                .filter((s) => s.status === "pending")
                .map((sale, idx, arr) => (
                  <ActivityRow
                    key={sale.id}
                    title={sale.carName}
                    subtitle={`${sale.customerName} · ${sale.salePrice}`}
                    time={sale.date}
                    type="cashIn"
                    isLast={idx === arr.length - 1}
                    onPress={() => navigation.navigate("SaleDetail", { saleId: sale.id })}
                  />
                ))}
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "500",
  },
  showroomName: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionItem: {
    width: 74,
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
  },
  actionIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
});
