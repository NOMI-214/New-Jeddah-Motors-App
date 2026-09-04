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
import { Button } from "../components/Button";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { CarStatus } from "../data/mockData";

interface Field {
  key: string;
  label: string;
  placeholder: string;
  keyboardType?: "default" | "numeric";
  required?: boolean;
}

const FIELDS: Field[] = [
  { key: "name", label: "Car Name", placeholder: "e.g. Toyota Corolla Altis", required: true },
  { key: "brand", label: "Brand", placeholder: "e.g. Toyota", required: true },
  { key: "model", label: "Model", placeholder: "e.g. Corolla Altis", required: true },
  { key: "year", label: "Year", placeholder: "e.g. 2022", keyboardType: "numeric", required: true },
  { key: "color", label: "Color", placeholder: "e.g. Pearl White" },
  { key: "registrationNumber", label: "Registration No.", placeholder: "e.g. ISB-4521" },
  { key: "chassisNumber", label: "Chassis No.", placeholder: "Chassis number" },
  { key: "engineNumber", label: "Engine No.", placeholder: "Engine number" },
  { key: "purchasePriceNum", label: "Purchase Price (Rs)", placeholder: "0", keyboardType: "numeric", required: true },
  { key: "salePriceNum", label: "Sale Price (Rs)", placeholder: "0", keyboardType: "numeric", required: true },
];

const STATUS_OPTIONS: CarStatus[] = ["available", "reserved", "sold"];

export const AddCarScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { addCar, appendLog, currentUser } = useApp();

  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<CarStatus>("available");
  const [submitting, setSubmitting] = useState(false);

  const set = (key: string, val: string) =>
    setValues((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    const missing = FIELDS.filter((f) => f.required && !values[f.key]?.trim());
    if (missing.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Missing fields", `Please fill: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    const purchaseNum = Number(values.purchasePriceNum) || 0;
    const saleNum = Number(values.salePriceNum) || 0;
    setSubmitting(true);
    try {
      await addCar({
        name: values.name,
        brand: values.brand,
        model: values.model,
        year: values.year,
        color: values.color ?? "",
        registrationNumber: values.registrationNumber ?? "",
        chassisNumber: values.chassisNumber ?? "",
        engineNumber: values.engineNumber ?? "",
        purchasePriceNum: purchaseNum,
        salePriceNum: saleNum,
        status,
      } as Parameters<typeof addCar>[0]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Car added", `${values.name} has been added to inventory.`, [
        { text: "Done", onPress: () => navigation.goBack() },
      ]);
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to add car.");
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Add Car</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {FIELDS.map((field) => (
            <View key={field.key}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {field.label}
                {field.required && <Text style={{ color: theme.colors.danger }}> *</Text>}
              </Text>
              <View style={[styles.inputBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
                <TextInput
                  value={values[field.key] ?? ""}
                  onChangeText={(v) => set(field.key, v)}
                  placeholder={field.placeholder}
                  placeholderTextColor={theme.colors.textFaint}
                  keyboardType={field.keyboardType ?? "default"}
                  style={[styles.input, { color: theme.colors.text }]}
                />
              </View>
            </View>
          ))}

          <View>
            <Text style={[styles.label, { color: theme.colors.text }]}>Status</Text>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((opt) => {
                const isActive = opt === status;
                return (
                  <AnimatedPressable
                    key={opt}
                    onPress={() => setStatus(opt)}
                    scaleTo={0.95}
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: isActive ? theme.colors.accent : theme.colors.surface,
                        borderColor: isActive ? theme.colors.accent : theme.colors.border,
                        borderRadius: theme.radius.md,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: isActive ? (theme.mode === "dark" ? "#0B0D10" : "#FFF") : theme.colors.textMuted }]}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>

          <Button label={submitting ? "Saving…" : "Add Car"} onPress={handleSave} loading={submitting} />
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
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  content: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 50, gap: 16 },
  label: { fontSize: 13.5, fontWeight: "600", marginBottom: 7 },
  inputBox: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  input: { fontSize: 14.5, padding: 0 },
  statusRow: { flexDirection: "row", gap: 8 },
  statusChip: { flex: 1, paddingVertical: 11, alignItems: "center", borderWidth: 1 },
  chipText: { fontSize: 13.5, fontWeight: "600" },
});
