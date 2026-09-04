import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { useApp } from "../context/AppContext";
import { Card } from "../components/Card";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { Installment } from "../data/mockData";

const statusColor = (status: Installment["status"], theme: ReturnType<typeof useTheme>) => ({
  overdue: theme.colors.danger,
  current: theme.colors.success,
  completed: theme.colors.textFaint,
}[status]);

const statusLabel = { overdue: "Overdue", current: "On Track", completed: "Completed" };

export const InstallmentsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { installments } = useApp();

  const totalOutstanding = installments
    .filter((i) => i.status !== "completed")
    .reduce((s, i) => s + i.remainingAmountNum, 0);

  const renderItem = ({ item }: { item: Installment }) => {
    const color = statusColor(item.status, theme);
    const pct = Math.round((item.paidAmountNum / item.totalAmountNum) * 100);
    return (
      <Card sheen style={styles.card}>
        <View style={styles.cardRow}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[styles.customerName, { color: theme.colors.text }]}>{item.customerName}</Text>
            <Text style={[styles.carName, { color: theme.colors.textMuted }]}>{item.carName}</Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: `${color}20`, borderRadius: theme.radius.pill },
            ]}
          >
            <Text style={[styles.badgeText, { color }]}>{statusLabel[item.status]}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={{ gap: 5 }}>
          <View style={[styles.progressBg, { backgroundColor: theme.colors.surfaceRaised, borderRadius: theme.radius.pill }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${pct}%` as unknown as number,
                  backgroundColor: color,
                  borderRadius: theme.radius.pill,
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>
              Paid: {item.paidAmount}
            </Text>
            <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>{pct}%</Text>
          </View>
        </View>

        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          <View style={styles.footerItem}>
            <Text style={[styles.footerLabel, { color: theme.colors.textMuted }]}>Remaining</Text>
            <Text style={[styles.footerValue, { color: theme.colors.danger }]}>{item.remainingAmount}</Text>
          </View>
          {item.status !== "completed" && (
            <View style={styles.footerItem}>
              <Text style={[styles.footerLabel, { color: theme.colors.textMuted }]}>Next Due</Text>
              <Text style={[styles.footerValue, { color: theme.colors.text }]}>{item.nextDueDate}</Text>
            </View>
          )}
          <View style={styles.footerItem}>
            <Text style={[styles.footerLabel, { color: theme.colors.textMuted }]}>Total</Text>
            <Text style={[styles.footerValue, { color: theme.colors.text }]}>{item.totalAmount}</Text>
          </View>
        </View>

        {/* Payment history */}
        {item.payments.length > 0 && (
          <View style={{ gap: 6 }}>
            <Text style={[styles.historyTitle, { color: theme.colors.textMuted }]}>Payment history</Text>
            {item.payments.map((p, idx) => (
              <View key={idx} style={styles.paymentRow}>
                <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                <Text style={[styles.paymentDate, { color: theme.colors.textMuted }]}>{p.date}</Text>
                <Text style={[styles.paymentAmount, { color: theme.colors.text }]}>{p.amount}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
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
          <Text style={[styles.title, { color: theme.colors.text }]}>Installments</Text>
        </View>

        <Card sheen style={styles.summaryCard}>
          <View style={styles.summaryInner}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>Outstanding</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.danger }]}>
                Rs {totalOutstanding.toLocaleString("en-PK")}
              </Text>
            </View>
            <View style={[{ width: 1, backgroundColor: theme.colors.border, height: 36 }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>Active Plans</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {installments.filter((i) => i.status !== "completed").length}
              </Text>
            </View>
            <View style={[{ width: 1, backgroundColor: theme.colors.border, height: 36 }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>Overdue</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.danger }]}>
                {installments.filter((i) => i.status === "overdue").length}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      <FlatList
        data={installments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={28} color={theme.colors.textFaint} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>No installment plans</Text>
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
  title: { fontSize: 22, fontWeight: "700", flex: 1, letterSpacing: -0.3 },
  summaryCard: { paddingVertical: 14 },
  summaryInner: { flexDirection: "row", alignItems: "center" },
  summaryItem: { flex: 1, alignItems: "center", gap: 3 },
  summaryLabel: { fontSize: 11.5, fontWeight: "600" },
  summaryValue: { fontSize: 15, fontWeight: "700" },
  list: { paddingHorizontal: 18, paddingBottom: 32 },
  card: { gap: 14 },
  cardRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  customerName: { fontSize: 15, fontWeight: "700" },
  carName: { fontSize: 12.5 },
  badge: { paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  progressBg: { height: 6, overflow: "hidden" },
  progressFill: { height: 6 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between" },
  progressText: { fontSize: 11.5 },
  footer: { flexDirection: "row", borderTopWidth: 1, paddingTop: 10 },
  footerItem: { flex: 1, gap: 3, alignItems: "center" },
  footerLabel: { fontSize: 11, fontWeight: "600" },
  footerValue: { fontSize: 13, fontWeight: "700" },
  historyTitle: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  paymentRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  paymentDate: { fontSize: 12.5, flex: 1 },
  paymentAmount: { fontSize: 12.5, fontWeight: "600" },
  empty: { alignItems: "center", gap: 10, paddingTop: 80 },
});
