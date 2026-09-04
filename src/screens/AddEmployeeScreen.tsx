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
import { EmployeeRole } from "../data/mockData";

const ROLES: { value: EmployeeRole; label: string }[] = [
  { value: "manager", label: "Manager" },
  { value: "accountant", label: "Accountant" },
  { value: "salesperson", label: "Salesperson" },
  { value: "admin", label: "Admin" },
];

const BRANCHES = ["Islamabad", "Rawalpindi", "Lahore", "Karachi", "Peshawar"];

export const AddEmployeeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { addEmployee, appendLog, currentUser } = useApp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState<EmployeeRole>("salesperson");
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Missing fields", "Name, email, and phone are required.");
      return;
    }
    setSubmitting(true);
    try {
      await addEmployee({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        role,
        branch,
        password: "demo1234",
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Employee added", `${name.trim()} has been added to the team.`, [
        { text: "Done", onPress: () => navigation.goBack() },
      ]);
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to add employee.");
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Add Employee</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {[
            { label: "Full Name *", value: name, onChangeText: setName, placeholder: "Employee full name", kbType: "default" as const },
            { label: "Email *", value: email, onChangeText: setEmail, placeholder: "employee@showroom.pk", kbType: "email-address" as const },
            { label: "Phone *", value: phone, onChangeText: setPhone, placeholder: "0300-XXXXXXX", kbType: "phone-pad" as const },
            { label: "Address", value: address, onChangeText: setAddress, placeholder: "Home address", kbType: "default" as const },
          ].map((f) => (
            <View key={f.label}>
              <Text style={[styles.label, { color: theme.colors.text }]}>{f.label}</Text>
              <View style={[styles.inputBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
                <TextInput
                  value={f.value}
                  onChangeText={f.onChangeText}
                  placeholder={f.placeholder}
                  placeholderTextColor={theme.colors.textFaint}
                  keyboardType={f.kbType}
                  autoCapitalize={f.kbType === "email-address" ? "none" : "words"}
                  style={[styles.input, { color: theme.colors.text }]}
                />
              </View>
            </View>
          ))}

          <View>
            <Text style={[styles.label, { color: theme.colors.text }]}>Role</Text>
            <View style={styles.chips}>
              {ROLES.map((r) => {
                const isActive = r.value === role;
                return (
                  <AnimatedPressable
                    key={r.value}
                    onPress={() => setRole(r.value)}
                    scaleTo={0.95}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isActive ? theme.colors.accent : theme.colors.surface,
                        borderColor: isActive ? theme.colors.accent : theme.colors.border,
                        borderRadius: theme.radius.pill,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: isActive ? (theme.mode === "dark" ? "#0B0D10" : "#FFF") : theme.colors.textMuted }]}>
                      {r.label}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>

          <View>
            <Text style={[styles.label, { color: theme.colors.text }]}>Branch</Text>
            <View style={styles.chips}>
              {BRANCHES.map((b) => {
                const isActive = b === branch;
                return (
                  <AnimatedPressable
                    key={b}
                    onPress={() => setBranch(b)}
                    scaleTo={0.95}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isActive ? theme.colors.steel : theme.colors.surface,
                        borderColor: isActive ? theme.colors.steel : theme.colors.border,
                        borderRadius: theme.radius.pill,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: isActive ? "#FFF" : theme.colors.textMuted }]}>
                      {b}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>

          <Button label={submitting ? "Saving…" : "Add Employee"} onPress={handleSave} loading={submitting} />
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
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "600" },
});
