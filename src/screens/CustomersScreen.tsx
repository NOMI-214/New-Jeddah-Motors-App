import React, { useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { useApp } from "../context/AppContext";
import { Card } from "../components/Card";
import { SearchBar } from "../components/SearchBar";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { Button } from "../components/Button";
import { Customer } from "../data/mockData";
import { RootStackParamList } from "../navigation/types";

export const CustomersScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { customers } = useApp();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (query.trim().length === 0) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query) ||
        c.cnic.includes(query)
    );
  }, [query, customers]);

  const totalOutstanding = customers.reduce((s, c) => s + c.outstandingAmountNum, 0);

  const initials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();

  const renderCustomer = ({ item }: { item: Customer }) => {
    const hasOutstanding = item.outstandingAmountNum > 0;
    return (
      <AnimatedPressable
        onPress={() => navigation.navigate("CustomerDetail", { customerId: item.id })}
        scaleTo={0.98}
      >
        <Card sheen style={styles.row}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.accentMuted, borderRadius: theme.radius.pill }]}>
            <Text style={[styles.avatarText, { color: theme.colors.accent }]}>{initials(item.name)}</Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.phone, { color: theme.colors.textMuted }]}>{item.phone}</Text>
          </View>
          <View style={styles.rightCol}>
            <Text
              style={[
                styles.amount,
                { color: hasOutstanding ? theme.colors.danger : theme.colors.textFaint },
              ]}
            >
              {hasOutstanding ? item.outstandingAmount : "Settled"}
            </Text>
            <Text style={[styles.carsCount, { color: theme.colors.textFaint }]}>
              {item.carsPurchased} car{item.carsPurchased !== 1 ? "s" : ""}
            </Text>
          </View>
        </Card>
      </AnimatedPressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <View style={[styles.headerSection, { gap: theme.spacing(3) }]}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Customers</Text>
            {totalOutstanding > 0 && (
              <Text style={[styles.subtitle, { color: theme.colors.danger }]}>
                Rs {totalOutstanding.toLocaleString("en-PK")} outstanding
              </Text>
            )}
          </View>
          <Button
            label="+ Add"
            style={{ paddingVertical: 8, paddingHorizontal: 14 }}
            onPress={() => navigation.navigate("AddCustomer")}
          />
        </View>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search by name, phone, or CNIC" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCustomer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people" size={28} color={theme.colors.textFaint} />
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No customers found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12.5,
    fontWeight: "600",
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
  },
  phone: {
    fontSize: 12.5,
    marginTop: 2,
  },
  rightCol: {
    alignItems: "flex-end",
    gap: 3,
  },
  amount: {
    fontSize: 13,
    fontWeight: "700",
  },
  carsCount: {
    fontSize: 11.5,
  },
  emptyState: {
    alignItems: "center",
    gap: 10,
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 14,
  },
});
