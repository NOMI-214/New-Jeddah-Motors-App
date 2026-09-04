import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { AnimatedPressable } from "../components/AnimatedPressable";

export const ForgotPasswordScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScrollView contentContainerStyle={styles.centerContent}>
          <Image source={require("../../assets/icon.png")} style={styles.logo} resizeMode="contain" />
          <View style={[styles.iconWrap, { backgroundColor: `${theme.colors.accent}18`, borderRadius: 48 }]}>
            <Ionicons name="mail-outline" size={48} color={theme.colors.accent} />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Contact Your Owner</Text>
          <Text style={[styles.body, { color: theme.colors.textMuted }]}>
            For security, passwords can only be reset by the showroom owner or an admin.{"\n\n"}
            Please contact{" "}
            <Text style={{ color: theme.colors.accent, fontWeight: "700" }}>Aqeel Shehzad</Text>
            {" "}(owner) to reset your password.
          </Text>
          <Card sheen style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.accent} />
              <Text style={[styles.infoText, { color: theme.colors.textMuted }]}>
                Owner logs in → Settings → Users → select you → Reset Password
              </Text>
            </View>
          </Card>
          <Button label="Back to Sign In" onPress={() => navigation.navigate("Login" as never)} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.centerContent}>
        <AnimatedPressable
          onPress={() => navigation.goBack()}
          scaleTo={0.9}
          haptic={false}
          style={[styles.backRow]}
        >
          <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          <Text style={[styles.backText, { color: theme.colors.text }]}>Back to Sign In</Text>
        </AnimatedPressable>

        <Image source={require("../../assets/icon.png")} style={styles.logo} resizeMode="contain" />

        <Text style={[styles.title, { color: theme.colors.text }]}>Forgot Password?</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Password resets are handled by the showroom owner for security. Tap below to see instructions.
        </Text>

        <Card sheen style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color={theme.colors.textMuted} />
            <Text style={[styles.infoText, { color: theme.colors.textMuted }]}>
              Contact the owner: Aqeel Shehzad
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="lock-open-outline" size={16} color={theme.colors.textMuted} />
            <Text style={[styles.infoText, { color: theme.colors.textMuted }]}>
              Owner can reset your password from the Users screen
            </Text>
          </View>
        </Card>

        <Button label="View Instructions" onPress={() => setDone(true)} />
        <AnimatedPressable onPress={() => navigation.goBack()} scaleTo={0.97} haptic={false} style={{ marginTop: 12 }}>
          <Text style={[styles.cancelText, { color: theme.colors.textMuted }]}>Cancel</Text>
        </AnimatedPressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centerContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 50,
    gap: 20,
    alignItems: "center",
  },
  backRow: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 4 },
  backText: { fontSize: 15, fontWeight: "600" },
  logo: { width: 100, height: 100 },
  title: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3, textAlign: "center" },
  body: { fontSize: 14, lineHeight: 22, textAlign: "center" },
  infoCard: { width: "100%", gap: 12 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoText: { fontSize: 13.5, flex: 1, lineHeight: 20 },
  iconWrap: { width: 96, height: 96, alignItems: "center", justifyContent: "center" },
  cancelText: { fontSize: 14, textAlign: "center" },
});
