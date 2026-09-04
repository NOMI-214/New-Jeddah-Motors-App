import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { useApp } from "../context/AppContext";
import { Card } from "../components/Card";
import { AnimatedPressable } from "../components/AnimatedPressable";

type Period = "today" | "week" | "month" | "year";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

const BarChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  maxVal: number;
}> = ({ data, maxVal }) => {
  const theme = useTheme();
  return (
    <View style={styles.chart}>
      {data.map((item, idx) => {
        const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
        return (
          <View key={idx} style={styles.barItem}>
            <Text style={[styles.barValue, { color: theme.colors.textMuted }]}>
              {item.value >= 1000000
                ? `${(item.value / 1000000).toFixed(1)}M`
                : item.value >= 1000
                ? `${(item.value / 1000).toFixed(0)}K`
                : item.value}
            </Text>
            <View style={[styles.barBg, { backgroundColor: theme.colors.surfaceRaised }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${Math.max(pct, 2)}%` as unknown as number,
                    backgroundColor: item.color,
                  },
                ]}
              />
            </View>
            <Text style={[styles.barLabel, { color: theme.colors.textFaint }]}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

export const ReportsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { transactions, expenses, sales } = useApp();
  const [period, setPeriod] = useState<Period>("month");

  const cashIn = useMemo(
    () => transactions.filter((t) => t.type === "cashIn").reduce((s, t) => s + t.amountNum, 0),
    [transactions]
  );
  const cashOut = useMemo(
    () => transactions.filter((t) => t.type === "cashOut").reduce((s, t) => s + t.amountNum, 0),
    [transactions]
  );
  const totalExpenses = useMemo(
    () => expenses.reduce((s, e) => s + e.amountNum, 0),
    [expenses]
  );
  const totalRevenue = useMemo(
    () => sales.reduce((s, s2) => s + s2.salePriceNum, 0),
    [sales]
  );
  const totalProfit = useMemo(
    () => sales.reduce((s, s2) => s + s2.profitNum, 0),
    [sales]
  );

  const fmt = (n: number) => "Rs " + n.toLocaleString("en-PK");

  // Weekly bar chart data (simulated)
  const weekData = [
    { label: "Mon", value: 125000 },
    { label: "Tue", value: 95000 },
    { label: "Wed", value: 240000 },
    { label: "Thu", value: 180000 },
    { label: "Fri", value: 310000 },
    { label: "Sat", value: 420000 },
    { label: "Sun", value: 85000 },
  ];
  const weekMax = Math.max(...weekData.map((d) => d.value));

  // Expense breakdown by category
  const expByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + e.amountNum;
    });
    return Object.entries(map)
      .map(([cat, amt]) => ({ category: cat, amount: amt }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const expTotal = expByCategory.reduce((s, e) => s + e.amount, 0);

  const categoryColors = [
    theme.colors.danger,
    theme.colors.warning,
    theme.colors.steel,
    theme.colors.success,
    theme.colors.accent,
    theme.colors.textMuted,
  ];

  // Top salespeople
  const topSalespeople = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};
    sales.forEach((s) => {
      if (!map[s.salespersonId]) map[s.salespersonId] = { name: s.salespersonName, count: 0, revenue: 0 };
      map[s.salespersonId].count++;
      map[s.salespersonId].revenue += s.salePriceNum;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <View style={[styles.headerSection, { gap: theme.spacing(3) }]}>
        <View style={styles.titleRow}>
          <AnimatedPressable onPress={() => navigation.goBack()} scaleTo={0.9} haptic={false}>
            <View style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
            </View>
          </AnimatedPressable>
          <Text style={[styles.title, { color: theme.colors.text }]}>Reports</Text>
        </View>

        {/* Period selector */}
        <View style={[styles.segmentRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
          {PERIOD_OPTIONS.map((opt) => {
            const isActive = opt.value === period;
            return (
              <AnimatedPressable
                key={opt.value}
                onPress={() => setPeriod(opt.value)}
                scaleTo={0.95}
                style={[
                  styles.segment,
                  {
                    backgroundColor: isActive ? theme.colors.accent : "transparent",
                    borderRadius: theme.radius.sm,
                  },
                ]}
              >
                <Text style={[styles.segmentText, { color: isActive ? (theme.mode === "dark" ? "#0B0D10" : "#FFF") : theme.colors.textMuted }]}>
                  {opt.label}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary cards */}
        <View style={styles.grid}>
          {[
            { label: "Cash In", value: fmt(cashIn), color: theme.colors.success, icon: "arrow-down-circle" as const },
            { label: "Cash Out", value: fmt(cashOut), color: theme.colors.danger, icon: "arrow-up-circle" as const },
            { label: "Expenses", value: fmt(totalExpenses), color: theme.colors.warning, icon: "receipt" as const },
            { label: "Revenue", value: fmt(totalRevenue), color: theme.colors.accent, icon: "trending-up" as const },
            { label: "Net Profit", value: fmt(totalProfit), color: theme.colors.success, icon: "cash" as const },
            { label: "Sales", value: String(sales.length), color: theme.colors.steel, icon: "car-sport" as const },
          ].map((item) => (
            <Card key={item.label} sheen style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${item.color}18`, borderRadius: theme.radius.md }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]} numberOfLines={1}>
                {item.value}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{item.label}</Text>
            </Card>
          ))}
        </View>

        {/* Revenue trend bar chart */}
        <View>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Revenue Trend (This Week)</Text>
          <Card sheen>
            <BarChart
              data={weekData.map((d, i) => ({
                label: d.label,
                value: d.value,
                color: i === weekData.length - 3 ? theme.colors.accent : theme.colors.steel,
              }))}
              maxVal={weekMax}
            />
          </Card>
        </View>

        {/* Expense breakdown */}
        <View>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Expense Breakdown</Text>
          <Card sheen style={{ gap: 12 }}>
            {expByCategory.map((item, idx) => {
              const pct = expTotal > 0 ? Math.round((item.amount / expTotal) * 100) : 0;
              const color = categoryColors[idx % categoryColors.length];
              return (
                <View key={item.category} style={{ gap: 5 }}>
                  <View style={styles.expRow}>
                    <View style={[styles.expDot, { backgroundColor: color }]} />
                    <Text style={[styles.expCat, { color: theme.colors.text }]}>{item.category}</Text>
                    <Text style={[styles.expAmt, { color: theme.colors.textMuted }]}>
                      Rs {item.amount.toLocaleString("en-PK")} · {pct}%
                    </Text>
                  </View>
                  <View style={[styles.expBg, { backgroundColor: theme.colors.surfaceRaised, borderRadius: theme.radius.pill }]}>
                    <View style={[styles.expFill, { width: `${pct}%` as unknown as number, backgroundColor: color, borderRadius: theme.radius.pill }]} />
                  </View>
                </View>
              );
            })}
          </Card>
        </View>

        {/* Top salespeople */}
        {topSalespeople.length > 0 && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Top Salespeople</Text>
            <Card sheen padded={false} style={{ paddingHorizontal: theme.spacing(4) }}>
              {topSalespeople.map((sp, idx) => (
                <View key={sp.name} style={styles.spRow}>
                  <View style={[styles.spRank, { backgroundColor: idx === 0 ? theme.colors.accentMuted : theme.colors.surfaceRaised, borderRadius: theme.radius.pill }]}>
                    <Text style={[styles.spRankText, { color: idx === 0 ? theme.colors.accent : theme.colors.textMuted }]}>
                      #{idx + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.spName, { color: theme.colors.text }]}>{sp.name}</Text>
                    <Text style={[styles.spMeta, { color: theme.colors.textMuted }]}>
                      {sp.count} sale{sp.count > 1 ? "s" : ""}
                    </Text>
                  </View>
                  <Text style={[styles.spRevenue, { color: theme.colors.accent }]}>
                    Rs {(sp.revenue / 1000000).toFixed(2)}M
                  </Text>
                </View>
              ))}
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerSection: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 14 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", flex: 1, letterSpacing: -0.3 },
  segmentRow: { flexDirection: "row", borderWidth: 1, padding: 4, gap: 3 },
  segment: { flex: 1, paddingVertical: 8, alignItems: "center" },
  segmentText: { fontSize: 12.5, fontWeight: "600" },
  content: { paddingHorizontal: 18, paddingBottom: 40, gap: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { flexBasis: "47%", flexGrow: 1, gap: 8, paddingVertical: 14 },
  statIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 14, fontWeight: "700" },
  statLabel: { fontSize: 11.5, fontWeight: "500" },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
  chart: { flexDirection: "row", height: 120, alignItems: "flex-end", gap: 8 },
  barItem: { flex: 1, alignItems: "center", gap: 4 },
  barBg: { width: "100%", height: 80, justifyContent: "flex-end", borderRadius: 4 },
  barFill: { width: "100%", borderRadius: 4 },
  barValue: { fontSize: 9 },
  barLabel: { fontSize: 9.5 },
  expRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  expDot: { width: 8, height: 8, borderRadius: 4 },
  expCat: { flex: 1, fontSize: 13.5, fontWeight: "600" },
  expAmt: { fontSize: 12 },
  expBg: { height: 5 },
  expFill: { height: 5 },
  spRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  spRank: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  spRankText: { fontSize: 12, fontWeight: "700" },
  spName: { fontSize: 14, fontWeight: "700" },
  spMeta: { fontSize: 12, marginTop: 1 },
  spRevenue: { fontSize: 14, fontWeight: "700" },
});
