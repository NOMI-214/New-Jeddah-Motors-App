import React, { useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { transactions, Transaction } from "../data/mockData";
import { RootStackParamList } from "../navigation/types";

export const TransactionsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState<"all" | "cashIn" | "cashOut">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [filter]);

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isCashIn = item.type === "cashIn";
    const color = isCashIn ? theme.colors.success : theme.colors.danger;
    return (
      <Card sheen style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: `${color}1F`, borderRadius: theme.radius.pill }]}>
          <Ionicons name={isCashIn ? "arrow-down" : "arrow-up"} size={16} color={color} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.party, { color: theme.colors.text }]} numberOfLines={1}>
            {item.party !== "—" ? item.party : item.category}
          </Text>
          <Text style={[styles.notes, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {item.category} · {item.date}
          </Text>
        </View>
        <Text style={[styles.amount, { color }]}>
          {isCashIn ? "+" : "−"} {item.amount.replace("Rs ", "")}
        </Text>
      </Card>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <View style={[styles.headerSection, { gap: theme.spacing(3) }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Transactions</Text>

        <View style={[styles.toggleRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
          {(["all", "cashIn", "cashOut"] as const).map((opt) => {
            const isActive = filter === opt;
            const label = opt === "all" ? "All" : opt === "cashIn" ? "Cash In" : "Cash Out";
            return (
              <AnimatedPressable
                key={opt}
                onPress={() => setFilter(opt)}
                scaleTo={0.96}
                style={[
                  styles.toggleOption,
                  {
                    backgroundColor: isActive ? theme.colors.accent : "transparent",
                    borderRadius: theme.radius.sm,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: isActive ? (theme.mode === "dark" ? "#0B0D10" : "#FFFFFF") : theme.colors.textMuted },
                  ]}
                >
                  {label}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
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
          style={{ flex: 1 }}
          onPress={() => navigation.navigate("AddTransaction", { type: "cashOut" })}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  toggleRow: {
    flexDirection: "row",
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
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
    fontSize: 14.5,
    fontWeight: "700",
  },
  notes: {
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
  },
});
