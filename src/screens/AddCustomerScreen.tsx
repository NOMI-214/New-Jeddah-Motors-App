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

interface Field {
  key: string;
  label: string;
  placeholder: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
  required?: boolean;
}

const FIELDS: Field[] = [
  { key: "name", label: "Full Name", placeholder: "Customer full name", required: true },
  { key: "phone", label: "Phone Number", placeholder: "0301-XXXXXXX", keyboardType: "phone-pad", required: true },
  { key: "cnic", label: "CNIC", placeholder: "XXXXX-XXXXXXX-X" },
  { key: "email", label: "Email", placeholder: "customer@email.com", keyboardType: "email-address" },
  { key: "address", label: "Address", placeholder: "Full address" },
];

export const AddCustomerScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { addCustomer, appendLog, currentUser } = useApp();

  const [values, setValues] = useState<Record<string, string>>({});
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
    setSubmitting(true);
    try {
      await addCustomer({
        name: values.name,
        phone: values.phone,
        cnic: values.cnic ?? "",
        email: values.email ?? "",
        address: values.address ?? "",
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Customer added", `${values.name} has been added.`, [
        { text: "Done", onPress: () => navigation.goBack() },
      ]);
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to add customer.");
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Add Customer</Text>
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
                  autoCapitalize={field.keyboardType === "email-address" ? "none" : "words"}
                  style={[styles.input, { color: theme.colors.text }]}
                />
              </View>
            </View>
          ))}

          <Button label={submitting ? "Saving…" : "Add Customer"} onPress={handleSave} loading={submitting} />
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
});
