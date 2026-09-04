import React, { useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { useApp } from "../context/AppContext";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { Transaction, Expense } from "../data/mockData";
import { RootStackParamList } from "../navigation/types";

type FinanceFilter = "all" | "cashIn" | "cashOut" | "expenses";

type FinanceItem =
  | { kind: "tx"; data: Transaction }
  | { kind: "exp"; data: Expense };

export const FinanceScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { transactions, expenses } = useApp();
  const [filter, setFilter] = useState<FinanceFilter>("all");

  const totalCashIn = useMemo(
    () => transactions.filter((t) => t.type === "cashIn").reduce((s, t) => s + t.amountNum, 0),
    [transactions]
  );
  const totalCashOut = useMemo(
    () => transactions.filter((t) => t.type === "cashOut").reduce((s, t) => s + t.amountNum, 0),
    [transactions]
  );
  const totalExpenses = useMemo(
    () => expenses.reduce((s, e) => s + e.amountNum, 0),
    [expenses]
  );
  const balance = totalCashIn - totalCashOut - totalExpenses;

  const fmt = (n: number) =>
    "Rs " + n.toLocaleString("en-PK");

  const items = useMemo<FinanceItem[]>(() => {
    const txItems: FinanceItem[] = transactions
      .filter((t) => filter === "all" || filter === t.type)
      .map((t) => ({ kind: "tx", data: t }));

    const expItems: FinanceItem[] =
      filter === "all" || filter === "expenses"
        ? expenses.map((e) => ({ kind: "exp", data: e }))
        : [];

    if (filter === "cashIn") return txItems;
    if (filter === "cashOut") return txItems;
    if (filter === "expenses") return expItems;
    return [...txItems, ...expItems];
  }, [transactions, expenses, filter]);

  const renderItem = ({ item }: { item: FinanceItem }) => {
    if (item.kind === "tx") {
      const tx = item.data;
      const isCashIn = tx.type === "cashIn";
      const color = isCashIn ? theme.colors.success : theme.colors.danger;
      return (
        <Card sheen style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: `${color}1F`, borderRadius: theme.radius.pill }]}>
            <Ionicons name={isCashIn ? "arrow-down" : "arrow-up"} size={16} color={color} />
          </View>
          <View style={styles.info}>
            <Text style={[styles.party, { color: theme.colors.text }]} numberOfLines={1}>
              {tx.party !== "—" ? tx.party : tx.category}
            </Text>
            <Text style={[styles.sub, { color: theme.colors.textMuted }]} numberOfLines={1}>
              {tx.category} · {tx.date}
            </Text>
          </View>
          <View style={styles.right}>
            <Text style={[styles.amount, { color }]}>
              {isCashIn ? "+" : "−"} {tx.amount.replace("Rs ", "")}
            </Text>
            <Text style={[styles.tag, { color: theme.colors.textFaint }]}>
              {isCashIn ? "Cash In" : "Cash Out"}
            </Text>
          </View>
        </Card>
      );
    }
    const exp = item.data;
    return (
      <Card sheen style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: `${theme.colors.warning}20`, borderRadius: theme.radius.pill }]}>
          <Ionicons name="receipt-outline" size={16} color={theme.colors.warning} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.party, { color: theme.colors.text }]} numberOfLines={1}>
            {exp.description || exp.category}
          </Text>
          <Text style={[styles.sub, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {exp.category} · {exp.date}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.amount, { color: theme.colors.warning }]}>
            − {exp.amount.replace("Rs ", "")}
          </Text>
          <Text style={[styles.tag, { color: theme.colors.textFaint }]}>Expense</Text>
        </View>
      </Card>
    );
  };

  const segments: { value: FinanceFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "cashIn", label: "Cash In" },
    { value: "cashOut", label: "Cash Out" },
    { value: "expenses", label: "Expenses" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <View style={[styles.header, { gap: theme.spacing(3) }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Finance</Text>

        {/* Balance card */}
        <Card sheen style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <View style={styles.balanceStat}>
              <Text style={[styles.balanceLabel, { color: theme.colors.textMuted }]}>Cash In</Text>
              <Text style={[styles.balanceVal, { color: theme.colors.success }]}>{fmt(totalCashIn)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.balanceStat}>
              <Text style={[styles.balanceLabel, { color: theme.colors.textMuted }]}>Expenses</Text>
              <Text style={[styles.balanceVal, { color: theme.colors.warning }]}>{fmt(totalExpenses)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.balanceStat}>
              <Text style={[styles.balanceLabel, { color: theme.colors.textMuted }]}>Balance</Text>
              <Text style={[styles.balanceVal, { color: balance >= 0 ? theme.colors.accent : theme.colors.danger }]}>
                {fmt(Math.abs(balance))}
              </Text>
            </View>
          </View>
        </Card>

        {/* Segment filter */}
        <View style={[styles.segmentRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
          {segments.map((seg) => {
            const isActive = seg.value === filter;
            return (
              <AnimatedPressable
                key={seg.value}
                onPress={() => setFilter(seg.value)}
                scaleTo={0.95}
                style={[
                  styles.segment,
                  {
                    backgroundColor: isActive ? theme.colors.accent : "transparent",
                    borderRadius: theme.radius.sm,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: isActive ? (theme.mode === "dark" ? "#0B0D10" : "#FFF") : theme.colors.textMuted },
                  ]}
                >
                  {seg.label}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item, i) => `${item.kind}-${item.kind === "tx" ? item.data.id : item.data.id}-${i}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={28} color={theme.colors.textFaint} />
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No records found</Text>
          </View>
        }
      />

      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <Button
          label="+ Cash In"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => navigation.navigate("AddTransaction", { type: "cashIn" })}
        />
        <Button
          label="+ Cash Out"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => navigation.navigate("AddTransaction", { type: "cashOut" })}
        />
        <Button
          label="+ Expense"
          style={{ flex: 1 }}
          onPress={() => navigation.navigate("AddExpense")}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  balanceCard: {
    paddingVertical: 14,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceStat: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  divider: {
    width: 1,
    height: 36,
  },
  balanceLabel: {
    fontSize: 11.5,
    fontWeight: "600",
  },
  balanceVal: {
    fontSize: 14,
    fontWeight: "700",
  },
  segmentRow: {
    flexDirection: "row",
    borderWidth: 1,
    padding: 4,
    gap: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  party: {
    fontSize: 14,
    fontWeight: "700",
  },
  sub: {
    fontSize: 12,
    marginTop: 2,
  },
  right: {
    alignItems: "flex-end",
    gap: 2,
  },
  amount: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  tag: {
    fontSize: 11,
  },
  empty: {
    alignItems: "center",
    gap: 10,
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
  },
});
