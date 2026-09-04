import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme/ThemeProvider";
import { useApp } from "../context/AppContext";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { RootStackParamList } from "../navigation/types";

const categories = {
  cashIn: ["Cash", "Bank Transfer", "Cheque", "Other"],
  cashOut: ["Fuel", "Salary", "Maintenance", "Rent", "Other"],
};

export const AddTransactionScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "AddTransaction">>();
  const { type } = route.params;
  const isCashIn = type === "cashIn";
  const { addTransaction, appendLog, currentUser } = useApp();

  const [amount, setAmount] = useState("");
  const [party, setParty] = useState("");
  const [category, setCategory] = useState(categories[type][0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const accentColor = isCashIn ? theme.colors.success : theme.colors.danger;

  const handleSubmit = async () => {
    if (!amount.trim() || isNaN(Number(amount))) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Amount required", "Please enter a valid amount before saving.");
      return;
    }
    setSubmitting(true);
    const amountNum = Number(amount);
    try {
      await addTransaction({
        type,
        amountNum,
        party: party.trim() || "—",
        category,
        notes: notes.trim(),
      } as Parameters<typeof addTransaction>[0]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Saved",
        `${isCashIn ? "Cash in" : "Cash out"} of Rs ${amountNum.toLocaleString("en-PK")} recorded.`,
        [{ text: "Done", onPress: () => navigation.goBack() }]
      );
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to save transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <AnimatedPressable onPress={() => navigation.goBack()} scaleTo={0.9} haptic={false}>
          <View style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </View>
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {isCashIn ? "New Cash In" : "New Cash Out"}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Card sheen style={styles.amountCard}>
            <Text style={[styles.amountLabel, { color: theme.colors.textMuted }]}>Amount (Rs)</Text>
            <View style={styles.amountInputRow}>
              <Text style={[styles.amountPrefix, { color: accentColor }]}>Rs</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor={theme.colors.textFaint}
                keyboardType="numeric"
                style={[styles.amountInput, { color: theme.colors.text }]}
              />
            </View>
          </Card>

          <View>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
              {isCashIn ? "Received from" : "Paid to (optional)"}
            </Text>
            <View style={[styles.inputBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
              <TextInput
                value={party}
                onChangeText={setParty}
                placeholder={isCashIn ? "Customer or dealer name" : "Vendor name"}
                placeholderTextColor={theme.colors.textFaint}
                style={[styles.input, { color: theme.colors.text }]}
              />
            </View>
          </View>

          <View>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Category</Text>
            <View style={styles.categoryRow}>
              {categories[type].map((cat) => {
                const isActive = cat === category;
                return (
                  <AnimatedPressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    scaleTo={0.95}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isActive ? accentColor : theme.colors.surface,
                        borderColor: isActive ? accentColor : theme.colors.border,
                        borderRadius: theme.radius.pill,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: isActive ? "#FFFFFF" : theme.colors.textMuted },
                      ]}
                    >
                      {cat}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>

          <View>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Notes (optional)</Text>
            <View style={[styles.inputBox, styles.notesBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Add a short note"
                placeholderTextColor={theme.colors.textFaint}
                multiline
                style={[styles.input, { color: theme.colors.text, height: 80, textAlignVertical: "top" }]}
              />
            </View>
          </View>

          <Button
            label={submitting ? "Saving..." : `Save ${isCashIn ? "Cash In" : "Cash Out"}`}
            onPress={handleSubmit}
            loading={submitting}
            style={{ marginTop: 8 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 50,
    gap: 20,
  },
  amountCard: {
    alignItems: "center",
    paddingVertical: 22,
    gap: 8,
  },
  amountLabel: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  amountPrefix: {
    fontSize: 22,
    fontWeight: "700",
  },
  amountInput: {
    fontSize: 36,
    fontWeight: "700",
    minWidth: 100,
    textAlign: "center",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  inputBox: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  notesBox: {
    paddingVertical: 10,
  },
  input: {
    fontSize: 14.5,
    padding: 0,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
