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
import { SearchBar } from "../components/SearchBar";
import { Sale } from "../data/mockData";
import { RootStackParamList } from "../navigation/types";

export const SalesScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { sales } = useApp();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return sales;
    const q = query.toLowerCase();
    return sales.filter(
      (s) =>
        s.carName.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.salespersonName.toLowerCase().includes(q)
    );
  }, [sales, query]);

  const totalRevenue = useMemo(
    () => sales.reduce((s, sale) => s + sale.salePriceNum, 0),
    [sales]
  );
  const totalProfit = useMemo(
    () => sales.reduce((s, sale) => s + sale.profitNum, 0),
    [sales]
  );

  const paymentIcon: Record<Sale["paymentType"], keyof typeof Ionicons.glyphMap> = {
    cash: "cash-outline",
    bank_transfer: "card-outline",
    cheque: "document-text-outline",
    installment: "time-outline",
  };

  const renderSale = ({ item }: { item: Sale }) => (
    <AnimatedPressable
      onPress={() => navigation.navigate("SaleDetail", { saleId: item.id })}
      scaleTo={0.98}
    >
      <Card sheen style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: theme.colors.accentMuted, borderRadius: theme.radius.md }]}>
            <Ionicons name="car-sport" size={20} color={theme.colors.accent} />
          </View>
          <View style={styles.cardMeta}>
            <Text style={[styles.carName, { color: theme.colors.text }]} numberOfLines={1}>
              {item.carName}
            </Text>
            <Text style={[styles.customerName, { color: theme.colors.textMuted }]} numberOfLines={1}>
              {item.customerName} · {item.date}
            </Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={[styles.price, { color: theme.colors.text }]}>{item.salePrice}</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    item.status === "completed"
                      ? `${theme.colors.success}20`
                      : `${theme.colors.warning}20`,
                  borderRadius: theme.radius.pill,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: item.status === "completed" ? theme.colors.success : theme.colors.warning },
                ]}
              >
                {item.status === "completed" ? "Completed" : "Pending"}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.cardFooter, { borderTopColor: theme.colors.border }]}>
          <View style={styles.footerItem}>
            <Ionicons name="trending-up" size={13} color={theme.colors.success} />
            <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
              Profit: <Text style={{ color: theme.colors.success }}>{item.profit}</Text>
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name={paymentIcon[item.paymentType]} size={13} color={theme.colors.textFaint} />
            <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
              {item.paymentType === "bank_transfer"
                ? "Bank Transfer"
                : item.paymentType.charAt(0).toUpperCase() + item.paymentType.slice(1)}
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="person-outline" size={13} color={theme.colors.textFaint} />
            <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
              {item.salespersonName}
            </Text>
          </View>
        </View>
      </Card>
    </AnimatedPressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <View style={[styles.headerSection, { gap: theme.spacing(3) }]}>
        <View style={styles.titleRow}>
          <AnimatedPressable onPress={() => navigation.goBack()} scaleTo={0.9} haptic={false}>
            <View style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
            </View>
          </AnimatedPressable>
          <Text style={[styles.title, { color: theme.colors.text }]}>Sales</Text>
          <Button
            label="+ Sale"
            style={{ paddingVertical: 8, paddingHorizontal: 14 }}
            onPress={() => navigation.navigate("AddSale", {})}
          />
        </View>

        {/* Summary row */}
        <View style={[styles.summaryRow, { gap: theme.spacing(3) }]}>
          <Card sheen style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>Revenue</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.accent }]}>
              Rs {(totalRevenue / 1000000).toFixed(2)}M
            </Text>
          </Card>
          <Card sheen style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>Profit</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
              Rs {(totalProfit / 1000).toFixed(0)}K
            </Text>
          </Card>
          <Card sheen style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>Sales</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{sales.length}</Text>
          </Card>
        </View>

        <SearchBar value={query} onChangeText={setQuery} placeholder="Search car, customer…" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderSale}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cart-outline" size={28} color={theme.colors.textFaint} />
            <Text style={[{ color: theme.colors.textMuted, fontSize: 14 }]}>No sales found</Text>
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
  summaryRow: { flexDirection: "row" },
  summaryCard: { flex: 1, alignItems: "center", gap: 3, paddingVertical: 12 },
  summaryLabel: { fontSize: 11.5, fontWeight: "600" },
  summaryValue: { fontSize: 16, fontWeight: "700" },
  list: { paddingHorizontal: 18, paddingBottom: 32 },
  card: { gap: 12 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconWrap: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  cardMeta: { flex: 1 },
  carName: { fontSize: 15, fontWeight: "700" },
  customerName: { fontSize: 12.5, marginTop: 2 },
  cardRight: { alignItems: "flex-end", gap: 6 },
  price: { fontSize: 14, fontWeight: "700" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: "700" },
  cardFooter: { flexDirection: "row", borderTopWidth: 1, paddingTop: 10, gap: 14 },
  footerItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  footerText: { fontSize: 12 },
  empty: { alignItems: "center", gap: 10, paddingTop: 80 },
});
