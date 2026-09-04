import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme/ThemeProvider";
import { useApp } from "../context/AppContext";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { AnimatedPressable } from "../components/AnimatedPressable";

const CATEGORIES = ["Rent", "Electricity", "Fuel", "Salary", "Maintenance", "Marketing", "Office Supplies", "Other"];

export const AddExpenseScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { addExpense, appendLog, currentUser } = useApp();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!amount.trim() || isNaN(Number(amount))) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Invalid amount", "Please enter a valid numeric amount.");
      return;
    }
    setSubmitting(true);
    const amountNum = Number(amount);
    try {
      await addExpense({
        category,
        amountNum,
        description: description.trim() || category,
      } as Parameters<typeof addExpense>[0]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Expense saved", `Rs ${amountNum.toLocaleString("en-PK")} under ${category}.`, [
        { text: "Done", onPress: () => navigation.goBack() },
      ]);
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to save expense.");
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>New Expense</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Card sheen style={styles.amountCard}>
            <Text style={[styles.amountLabel, { color: theme.colors.textMuted }]}>Amount (Rs)</Text>
            <View style={styles.amountRow}>
              <Text style={[styles.prefix, { color: theme.colors.warning }]}>Rs</Text>
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
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Category</Text>
            <View style={styles.chips}>
              {CATEGORIES.map((cat) => {
                const isActive = cat === category;
                return (
                  <AnimatedPressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    scaleTo={0.94}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isActive ? theme.colors.warning : theme.colors.surface,
                        borderColor: isActive ? theme.colors.warning : theme.colors.border,
                        borderRadius: theme.radius.pill,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: isActive ? "#FFF" : theme.colors.textMuted }]}>
                      {cat}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>

          <View>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Description (optional)</Text>
            <View style={[styles.inputBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Brief description of the expense"
                placeholderTextColor={theme.colors.textFaint}
                multiline
                style={[styles.textArea, { color: theme.colors.text }]}
              />
            </View>
          </View>

          <Button
            label={submitting ? "Saving…" : "Save Expense"}
            onPress={handleSave}
            loading={submitting}
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
  headerTitle: { fontSize: 16, fontWeight: "700" },
  content: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 50, gap: 20 },
  amountCard: { alignItems: "center", paddingVertical: 22, gap: 8 },
  amountLabel: { fontSize: 12.5, fontWeight: "600" },
  amountRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  prefix: { fontSize: 22, fontWeight: "700" },
  amountInput: { fontSize: 36, fontWeight: "700", minWidth: 100, textAlign: "center" },
  fieldLabel: { fontSize: 14, fontWeight: "700", marginBottom: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "600" },
  inputBox: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  textArea: { fontSize: 14.5, minHeight: 80, textAlignVertical: "top", padding: 0 },
});
