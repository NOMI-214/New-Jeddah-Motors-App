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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme/ThemeProvider";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { changePassword } from "../api";

interface Field {
  key: "current" | "newPwd" | "confirm";
  label: string;
  placeholder: string;
}

const FIELDS: Field[] = [
  { key: "current", label: "Current Password", placeholder: "Enter current password" },
  { key: "newPwd", label: "New Password", placeholder: "Min 6 characters" },
  { key: "confirm", label: "Confirm New Password", placeholder: "Re-enter new password" },
];

export const ChangePasswordScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  const [values, setValues] = useState({ current: "", newPwd: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPwd: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof values, val: string) =>
    setValues((p) => ({ ...p, [key]: val }));
  const toggleShow = (key: keyof typeof show) =>
    setShow((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setError("");
    if (!values.current || !values.newPwd || !values.confirm) {
      setError("All fields are required.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (values.newPwd.length < 6) {
      setError("New password must be at least 6 characters.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (values.newPwd !== values.confirm) {
      setError("New passwords do not match.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    try {
      await changePassword(values.current, values.newPwd, values.confirm);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Password changed", "Your password has been updated successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password.";
      setError(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <AnimatedPressable onPress={() => navigation.goBack()} scaleTo={0.9} haptic={false}>
          <View style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </View>
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Change Password</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { gap: theme.spacing(4) }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Card sheen style={{ gap: theme.spacing(4) }}>
            {FIELDS.map((f) => (
              <View key={f.key}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>{f.label}</Text>
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
                  <Ionicons name="lock-closed-outline" size={17} color={theme.colors.textFaint} />
                  <TextInput
                    value={values[f.key]}
                    onChangeText={(v) => set(f.key, v)}
                    placeholder={f.placeholder}
                    placeholderTextColor={theme.colors.textFaint}
                    secureTextEntry={!show[f.key]}
                    style={[styles.input, { color: theme.colors.text }]}
                    autoCapitalize="none"
                  />
                  <Pressable onPress={() => toggleShow(f.key)}>
                    <Ionicons
                      name={show[f.key] ? "eye-off-outline" : "eye-outline"}
                      size={17}
                      color={theme.colors.textFaint}
                    />
                  </Pressable>
                </View>
              </View>
            ))}
          </Card>

          {!!error && (
            <View style={[styles.errorBox, { backgroundColor: `${theme.colors.danger}12`, borderRadius: theme.radius.md }]}>
              <Ionicons name="alert-circle-outline" size={16} color={theme.colors.danger} />
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
            </View>
          )}

          <Button label={loading ? "Saving…" : "Save New Password"} onPress={handleSave} loading={loading} />
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
  content: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 50 },
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
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  errorText: { fontSize: 13.5, fontWeight: "500", flex: 1 },
});
