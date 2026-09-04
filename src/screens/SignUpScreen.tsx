import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme/ThemeProvider";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { register } from "../api";
import { AuthStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<AuthStackParamList>;

type Role = "manager" | "accountant" | "salesperson" | "admin";
const ROLES: { value: Role; label: string }[] = [
  { value: "salesperson", label: "Salesperson" },
  { value: "manager", label: "Manager" },
  { value: "accountant", label: "Accountant" },
  { value: "admin", label: "Admin" },
];

const BRANCHES = ["Islamabad", "Rawalpindi", "Lahore", "Karachi", "Peshawar"];

interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  secure?: boolean;
  required?: boolean;
}

const FIELDS: FieldConfig[] = [
  { key: "name", label: "Full Name", placeholder: "Your full name", required: true },
  { key: "email", label: "Email", placeholder: "your@email.com", keyboardType: "email-address", required: true },
  { key: "phone", label: "Phone", placeholder: "0300-XXXXXXX", keyboardType: "phone-pad", required: true },
  { key: "password", label: "Password", placeholder: "Min 6 characters", secure: true, required: true },
  { key: "confirm", label: "Confirm Password", placeholder: "Re-enter password", secure: true, required: true },
  { key: "address", label: "Address", placeholder: "Home / office address" },
];

export const SignUpScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();

  const [values, setValues] = useState<Record<string, string>>({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState<Role>("salesperson");
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const set = (key: string, val: string) => setValues((p) => ({ ...p, [key]: val }));

  const validate = (): string | null => {
    for (const f of FIELDS) {
      if (f.required && !values[f.key]?.trim()) return `${f.label} is required.`;
    }
    if (values.password.length < 6) return "Password must be at least 6 characters.";
    if (values.password !== values.confirm) return "Passwords do not match.";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(values.email.trim())) return "Please enter a valid email address.";
    return null;
  };

  const handleSubmit = async () => {
    setError("");
    const err = validate();
    if (err) {
      setError(err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
        role,
        branch,
        address: values.address?.trim() ?? "",
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScrollView contentContainerStyle={styles.successContent}>
          <Image source={require("../../assets/icon.png")} style={styles.successLogo} resizeMode="contain" />
          <View style={[styles.successIcon, { backgroundColor: `${theme.colors.success}18`, borderRadius: 48 }]}>
            <Ionicons name="checkmark-circle" size={56} color={theme.colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: theme.colors.text }]}>Request Submitted!</Text>
          <Text style={[styles.successBody, { color: theme.colors.textMuted }]}>
            Your account request has been sent to the owner for approval. You will be able to sign in once your account is approved.
          </Text>
          <Card sheen style={styles.successCard}>
            <View style={styles.successRow}>
              <Ionicons name="person-outline" size={16} color={theme.colors.textMuted} />
              <Text style={[styles.successMeta, { color: theme.colors.textMuted }]}>{values.name}</Text>
            </View>
            <View style={styles.successRow}>
              <Ionicons name="mail-outline" size={16} color={theme.colors.textMuted} />
              <Text style={[styles.successMeta, { color: theme.colors.textMuted }]}>{values.email}</Text>
            </View>
            <View style={styles.successRow}>
              <Ionicons name="briefcase-outline" size={16} color={theme.colors.textMuted} />
              <Text style={[styles.successMeta, { color: theme.colors.textMuted }]}>
                {ROLES.find((r) => r.value === role)?.label} · {branch}
              </Text>
            </View>
          </Card>
          <Button label="Back to Sign In" onPress={() => navigation.navigate("Login")} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { gap: theme.spacing(5) }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <AnimatedPressable onPress={() => navigation.goBack()} scaleTo={0.9} haptic={false}>
              <View style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}>
                <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
              </View>
            </AnimatedPressable>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                Your request will be reviewed by the owner
              </Text>
            </View>
          </View>

          {/* Account info */}
          <Card sheen style={{ gap: theme.spacing(4) }}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account Information</Text>
            {FIELDS.map((f) => {
              const isPassword = f.secure;
              const isConfirm = f.key === "confirm";
              const showToggle = isPassword;
              const secureEntry = isPassword ? (isConfirm ? !showConfirm : !showPwd) : false;
              return (
                <View key={f.key}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>
                    {f.label}{f.required ? " *" : ""}
                  </Text>
                  <View
                    style={[
                      styles.inputBox,
                      {
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.border,
                        borderRadius: theme.radius.md,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        f.key === "email" ? "mail-outline" :
                        f.key === "phone" ? "call-outline" :
                        isPassword ? "lock-closed-outline" :
                        f.key === "address" ? "location-outline" :
                        "person-outline"
                      }
                      size={17}
                      color={theme.colors.textFaint}
                    />
                    <TextInput
                      value={values[f.key] ?? ""}
                      onChangeText={(v) => set(f.key, v)}
                      placeholder={f.placeholder}
                      placeholderTextColor={theme.colors.textFaint}
                      keyboardType={f.keyboardType ?? "default"}
                      autoCapitalize={f.key === "email" ? "none" : "words"}
                      secureTextEntry={secureEntry}
                      style={[styles.input, { color: theme.colors.text }]}
                    />
                    {showToggle && (
                      <Pressable onPress={() => isConfirm ? setShowConfirm((p) => !p) : setShowPwd((p) => !p)}>
                        <Ionicons
                          name={(isConfirm ? showConfirm : showPwd) ? "eye-off-outline" : "eye-outline"}
                          size={17}
                          color={theme.colors.textFaint}
                        />
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </Card>

          {/* Role */}
          <Card sheen style={{ gap: theme.spacing(3) }}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Role</Text>
            <View style={styles.chips}>
              {ROLES.map((r) => {
                const active = r.value === role;
                return (
                  <AnimatedPressable
                    key={r.value}
                    onPress={() => setRole(r.value)}
                    scaleTo={0.95}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? theme.colors.accent : theme.colors.background,
                        borderColor: active ? theme.colors.accent : theme.colors.border,
                        borderRadius: theme.radius.pill,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? (theme.mode === "dark" ? "#0B0D10" : "#FFF") : theme.colors.textMuted }]}>
                      {r.label}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </Card>

          {/* Branch */}
          <Card sheen style={{ gap: theme.spacing(3) }}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Branch</Text>
            <View style={styles.chips}>
              {BRANCHES.map((b) => {
                const active = b === branch;
                return (
                  <AnimatedPressable
                    key={b}
                    onPress={() => setBranch(b)}
                    scaleTo={0.95}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? theme.colors.accent : theme.colors.background,
                        borderColor: active ? theme.colors.accent : theme.colors.border,
                        borderRadius: theme.radius.pill,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? (theme.mode === "dark" ? "#0B0D10" : "#FFF") : theme.colors.textMuted }]}>
                      {b}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </Card>

          {/* Error */}
          {!!error && (
            <View style={[styles.errorBox, { backgroundColor: `${theme.colors.danger}12`, borderRadius: theme.radius.md }]}>
              <Ionicons name="alert-circle-outline" size={16} color={theme.colors.danger} />
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
            </View>
          )}

          <Button label={loading ? "Submitting…" : "Submit Request"} onPress={handleSubmit} loading={loading} />

          {/* Back to login */}
          <View style={styles.loginRow}>
            <Text style={[styles.loginText, { color: theme.colors.textMuted }]}>Already have an account?</Text>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text style={[styles.loginLink, { color: theme.colors.accent }]}> Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 50 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  subtitle: { fontSize: 13, marginTop: 2 },
  sectionTitle: { fontSize: 14.5, fontWeight: "700" },
  fieldLabel: { fontSize: 12.5, fontWeight: "600", marginBottom: 6 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 10,
  },
  input: { flex: 1, fontSize: 14, padding: 0 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "600" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  errorText: { fontSize: 13.5, fontWeight: "500", flex: 1 },
  loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingBottom: 8 },
  loginText: { fontSize: 13.5 },
  loginLink: { fontSize: 13.5, fontWeight: "700" },
  // Success
  successContent: { flex: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 50, gap: 20, alignItems: "center" },
  successLogo: { width: 120, height: 120 },
  successIcon: { width: 96, height: 96, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 24, fontWeight: "800", letterSpacing: -0.3 },
  successBody: { fontSize: 14.5, textAlign: "center", lineHeight: 22 },
  successCard: { width: "100%", gap: 10 },
  successRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  successMeta: { fontSize: 13.5, flex: 1 },
});
