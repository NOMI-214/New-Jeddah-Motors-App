import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { useApp } from "../context/AppContext";
import { Card } from "../components/Card";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { RootStackParamList } from "../navigation/types";

const Row: React.FC<{ label: string; value: string; valueColor?: string }> = ({ label, value, valueColor }) => {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: valueColor ?? theme.colors.text }]}>{value}</Text>
    </View>
  );
};

export const SaleDetailScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "SaleDetail">>();
  const { sales } = useApp();

  const sale = sales.find((s) => s.id === route.params.saleId);

  if (!sale) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: theme.colors.textMuted }}>Sale not found</Text>
      </SafeAreaView>
    );
  }

  const paymentLabel: Record<typeof sale.paymentType, string> = {
    cash: "Cash",
    bank_transfer: "Bank Transfer",
    cheque: "Cheque",
    installment: "Installment",
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
          Sale Detail
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <Card sheen style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: theme.colors.accentMuted, borderRadius: theme.radius.lg }]}>
            <Ionicons name="car-sport" size={32} color={theme.colors.accent} />
          </View>
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>{sale.carName}</Text>
          <Text style={[styles.heroSub, { color: theme.colors.textMuted }]}>
            Sold to {sale.customerName} · {sale.date}
          </Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  sale.status === "completed"
                    ? `${theme.colors.success}20`
                    : `${theme.colors.warning}20`,
                borderRadius: theme.radius.pill,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: sale.status === "completed" ? theme.colors.success : theme.colors.warning },
              ]}
            >
              {sale.status === "completed" ? "Completed" : "Payment Pending"}
            </Text>
          </View>
        </Card>

        {/* Financials */}
        <View>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Financials</Text>
          <Card sheen padded={false} style={{ paddingHorizontal: theme.spacing(4) }}>
            <Row label="Sale price" value={sale.salePrice} />
            <Row label="Purchase price" value={sale.purchasePrice} />
            <Row
              label="Profit"
              value={sale.profit}
              valueColor={theme.colors.success}
            />
            <Row label="Payment type" value={paymentLabel[sale.paymentType]} />
          </Card>
        </View>

        {/* Details */}
        <View>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Details</Text>
          <Card sheen padded={false} style={{ paddingHorizontal: theme.spacing(4) }}>
            <Row label="Customer" value={sale.customerName} />
            <Row label="Salesperson" value={sale.salespersonName} />
            <Row label="Date" value={sale.date} />
            {!!sale.notes && <Row label="Notes" value={sale.notes} />}
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
  hero: { alignItems: "center", gap: 8, paddingVertical: 26 },
  heroIcon: { width: 64, height: 64, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  heroTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  heroSub: { fontSize: 13 },
  badge: { paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  rowLabel: { fontSize: 13.5 },
  rowValue: { fontSize: 13.5, fontWeight: "600", maxWidth: "55%", textAlign: "right" },
});
