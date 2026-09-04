import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { useApp } from "../context/AppContext";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { RootStackParamList } from "../navigation/types";

const DetailRow: React.FC<{ icon: keyof typeof Ionicons.glyphMap; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => {
  const theme = useTheme();
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={17} color={theme.colors.textMuted} style={{ width: 22 }} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: theme.colors.text }]}>{value}</Text>
      </View>
    </View>
  );
};

export const CustomerDetailScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "CustomerDetail">>();
  const { customers, sales } = useApp();

  const customer = customers.find((c) => c.id === route.params.customerId);

  if (!customer) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: theme.colors.textMuted }}>Customer not found</Text>
      </SafeAreaView>
    );
  }

  const customerSales = sales.filter((s) => s.customerId === customer.id);
  const hasOutstanding = customer.outstandingAmountNum > 0;

  const initials = customer.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <AnimatedPressable onPress={() => navigation.goBack()} scaleTo={0.9} haptic={false}>
          <View style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </View>
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {customer.name}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card sheen style={styles.heroCard}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.accentMuted, borderRadius: theme.radius.pill }]}>
            <Text style={[styles.avatarText, { color: theme.colors.accent }]}>{initials}</Text>
          </View>
          <Text style={[styles.heroName, { color: theme.colors.text }]}>{customer.name}</Text>
          <Text style={[styles.heroMeta, { color: theme.colors.textMuted }]}>
            {customer.carsPurchased} car{customer.carsPurchased !== 1 ? "s" : ""} purchased · Member since {customer.joinDate}
          </Text>
        </Card>

        <Card
          sheen
          style={[
            styles.balanceCard,
            { backgroundColor: hasOutstanding ? `${theme.colors.danger}14` : theme.colors.surface },
          ]}
        >
          <Text style={[styles.balanceLabel, { color: theme.colors.textMuted }]}>Outstanding balance</Text>
          <Text
            style={[
              styles.balanceValue,
              { color: hasOutstanding ? theme.colors.danger : theme.colors.success },
            ]}
          >
            {hasOutstanding ? customer.outstandingAmount : "Fully settled"}
          </Text>
          {hasOutstanding && (
            <Button
              label="Record Payment"
              variant="secondary"
              style={{ marginTop: 8, paddingVertical: 9 }}
              onPress={() => navigation.navigate("AddTransaction", { type: "cashIn" })}
            />
          )}
        </Card>

        <View>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contact details</Text>
          <Card sheen padded={false} style={{ paddingHorizontal: theme.spacing(4) }}>
            <DetailRow icon="call" label="Phone" value={customer.phone} />
            {!!customer.cnic && <DetailRow icon="card" label="CNIC" value={customer.cnic} />}
            {!!customer.email && <DetailRow icon="mail" label="Email" value={customer.email} />}
            {!!customer.address && <DetailRow icon="location" label="Address" value={customer.address} />}
          </Card>
        </View>

        {customerSales.length > 0 && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Purchase history</Text>
            <Card sheen padded={false} style={{ paddingHorizontal: theme.spacing(4) }}>
              {customerSales.map((sale, idx, arr) => (
                <AnimatedPressable
                  key={sale.id}
                  onPress={() => navigation.navigate("SaleDetail", { saleId: sale.id })}
                  scaleTo={0.98}
                  style={
                    idx < arr.length - 1
                      ? [styles.saleRow, { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]
                      : styles.saleRow
                  }
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.saleName, { color: theme.colors.text }]}>{sale.carName}</Text>
                    <Text style={[styles.saleMeta, { color: theme.colors.textMuted }]}>{sale.date} · {sale.salePrice}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textFaint} />
                </AnimatedPressable>
              ))}
            </Card>
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 18,
  },
  heroCard: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 26,
  },
  avatar: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
  },
  heroName: {
    fontSize: 18,
    fontWeight: "700",
  },
  heroMeta: {
    fontSize: 12.5,
    textAlign: "center",
  },
  balanceCard: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 18,
  },
  balanceLabel: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  saleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  saleName: {
    fontSize: 14,
    fontWeight: "600",
  },
  saleMeta: {
    fontSize: 12,
    marginTop: 2,
  },
});
