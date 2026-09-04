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
import { useApp } from "../context/AppContext";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { AuthStackParamList } from "../navigation/types";

const DEMO_ACCOUNTS = [
  { label: "Owner", email: "owner@showroom.com" },
  { label: "Manager", email: "manager@showroom.com" },
  { label: "Accountant", email: "accountant@showroom.com" },
  { label: "Salesperson", email: "salesperson@showroom.com" },
];

export const LoginScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { login } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Login failed.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo1234");
    setError("");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { gap: theme.spacing(6) }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Brand */}
          <View style={styles.hero}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.tagline, { color: theme.colors.textMuted }]}>
              New Jeddah Motors
            </Text>
          </View>

          {/* Login form */}
          <Card sheen style={{ gap: theme.spacing(4) }}>
            <Text style={[styles.formTitle, { color: theme.colors.text }]}>Sign in</Text>

            <View style={{ gap: theme.spacing(3) }}>
              <View>
                <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>Email</Text>
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
                  <Ionicons name="mail-outline" size={18} color={theme.colors.textFaint} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor={theme.colors.textFaint}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[styles.input, { color: theme.colors.text }]}
                  />
                </View>
              </View>

              <View>
                <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>Password</Text>
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
                  <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textFaint} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor={theme.colors.textFaint}
                    secureTextEntry={!showPassword}
                    style={[styles.input, { color: theme.colors.text, flex: 1 }]}
                  />
                  <Pressable onPress={() => setShowPassword((p) => !p)}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color={theme.colors.textFaint}
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            {!!error && (
              <View style={[styles.errorBox, { backgroundColor: `${theme.colors.danger}18`, borderRadius: theme.radius.md }]}>
                <Ionicons name="alert-circle-outline" size={16} color={theme.colors.danger} />
                <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
              </View>
            )}

            <Button label={loading ? "Signing in…" : "Sign in"} onPress={handleLogin} loading={loading} />

            <Pressable
              onPress={() => navigation.navigate("ForgotPassword")}
              style={{ alignItems: "center", paddingTop: 4 }}
            >
              <Text style={[styles.forgotText, { color: theme.colors.accent }]}>Forgot password?</Text>
            </Pressable>
          </Card>

          {/* Sign up link */}
          <View style={styles.signUpRow}>
            <Text style={[styles.signUpText, { color: theme.colors.textMuted }]}>New staff member?</Text>
            <Pressable onPress={() => navigation.navigate("SignUp")}>
              <Text style={[styles.signUpLink, { color: theme.colors.accent }]}> Request an account</Text>
            </Pressable>
          </View>

          {/* Demo accounts */}
          <View style={{ gap: theme.spacing(3) }}>
            <Text style={[styles.demoTitle, { color: theme.colors.textMuted }]}>
              Demo accounts (password: demo1234)
            </Text>
            <View style={styles.demoRow}>
              {DEMO_ACCOUNTS.map((acc) => (
                <Pressable
                  key={acc.email}
                  onPress={() => fillDemo(acc.email)}
                  style={({ pressed }) => [
                    styles.demoChip,
                    {
                      backgroundColor: pressed ? theme.colors.accentMuted : theme.colors.surface,
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.pill,
                    },
                  ]}
                >
                  <Text style={[styles.demoChipText, { color: theme.colors.text }]}>{acc.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  hero: {
    alignItems: "center",
    gap: 6,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "500",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    padding: 0,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 13.5,
    fontWeight: "500",
    flex: 1,
  },
  demoTitle: {
    fontSize: 12.5,
    textAlign: "center",
    fontWeight: "500",
  },
  demoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  demoChip: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  demoChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: { fontSize: 13.5 },
  signUpLink: { fontSize: 13.5, fontWeight: "700" },
  forgotText: { fontSize: 13.5, fontWeight: "600" },
});
