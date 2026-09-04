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
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme/ThemeProvider";
import { useApp } from "../context/AppContext";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { Sale } from "../data/mockData";
import { RootStackParamList } from "../navigation/types";

type PaymentType = Sale["paymentType"];

const PAYMENT_TYPES: { value: PaymentType; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "installment", label: "Installment" },
];

export const AddSaleScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "AddSale">>();
  const { cars, customers, currentUser, addSale, appendLog } = useApp();

  const availableCars = cars.filter((c) => c.status === "available");

  const [selectedCarId, setSelectedCarId] = useState(route.params?.carId ?? (availableCars[0]?.id ?? ""));
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id ?? "");
  const [paymentType, setPaymentType] = useState<PaymentType>("cash");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedCar = cars.find((c) => c.id === selectedCarId);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleSave = async () => {
    if (!selectedCar) {
      Alert.alert("Select a car", "Please select an available car.");
      return;
    }
    if (!selectedCustomer) {
      Alert.alert("Select a customer", "Please select a customer.");
      return;
    }
    setSubmitting(true);
    try {
      await addSale({
        carIdNum: Number(selectedCar.id),
        customerIdNum: Number(selectedCustomer.id),
        salePriceNum: selectedCar.salePriceNum,
        paymentType,
        notes: notes.trim(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Sale recorded", `${selectedCar.name} sold to ${selectedCustomer.name}.`, [
        { text: "Done", onPress: () => navigation.goBack() },
      ]);
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to record sale.");
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Record Sale</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Car selection */}
          <View>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Select Car</Text>
            <View style={styles.selectList}>
              {availableCars.length === 0 ? (
                <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>No available cars</Text>
              ) : (
                availableCars.map((car) => {
                  const isActive = car.id === selectedCarId;
                  return (
                    <AnimatedPressable
                      key={car.id}
                      onPress={() => setSelectedCarId(car.id)}
                      scaleTo={0.97}
                      style={[
                        styles.selectItem,
                        {
                          backgroundColor: isActive ? theme.colors.accentMuted : theme.colors.surface,
                          borderColor: isActive ? theme.colors.accent : theme.colors.border,
                          borderRadius: theme.radius.md,
                        },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.selectTitle, { color: theme.colors.text }]}>{car.name}</Text>
                        <Text style={[styles.selectSub, { color: theme.colors.textMuted }]}>
                          {car.year} · {car.salePrice}
                        </Text>
                      </View>
                      {isActive && <Ionicons name="checkmark-circle" size={20} color={theme.colors.accent} />}
                    </AnimatedPressable>
                  );
                })
              )}
            </View>
          </View>

          {/* Customer selection */}
          <View>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Select Customer</Text>
            <View style={styles.selectList}>
              {customers.map((cust) => {
                const isActive = cust.id === selectedCustomerId;
                return (
                  <AnimatedPressable
                    key={cust.id}
                    onPress={() => setSelectedCustomerId(cust.id)}
                    scaleTo={0.97}
                    style={[
                      styles.selectItem,
                      {
                        backgroundColor: isActive ? theme.colors.accentMuted : theme.colors.surface,
                        borderColor: isActive ? theme.colors.accent : theme.colors.border,
                        borderRadius: theme.radius.md,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.selectTitle, { color: theme.colors.text }]}>{cust.name}</Text>
                      <Text style={[styles.selectSub, { color: theme.colors.textMuted }]}>{cust.phone}</Text>
                    </View>
                    {isActive && <Ionicons name="checkmark-circle" size={20} color={theme.colors.accent} />}
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>

          {/* Price preview */}
          {selectedCar && (
            <Card sheen style={styles.priceCard}>
              <Text style={[styles.priceLabel, { color: theme.colors.textMuted }]}>Sale Summary</Text>
              <View style={styles.priceRow}>
                <Text style={[styles.priceKey, { color: theme.colors.textMuted }]}>Sale Price</Text>
                <Text style={[styles.priceVal, { color: theme.colors.text }]}>{selectedCar.salePrice}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={[styles.priceKey, { color: theme.colors.textMuted }]}>Purchase Price</Text>
                <Text style={[styles.priceVal, { color: theme.colors.text }]}>{selectedCar.purchasePrice}</Text>
              </View>
              <View style={[styles.priceRow, { paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
                <Text style={[styles.priceKey, { color: theme.colors.textMuted }]}>Profit</Text>
                <Text style={[styles.priceVal, { color: theme.colors.success, fontWeight: "700" }]}>
                  Rs {(selectedCar.salePriceNum - selectedCar.purchasePriceNum).toLocaleString("en-PK")}
                </Text>
              </View>
            </Card>
          )}

          {/* Payment type */}
          <View>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Payment Type</Text>
            <View style={styles.chips}>
              {PAYMENT_TYPES.map((pt) => {
                const isActive = pt.value === paymentType;
                return (
                  <AnimatedPressable
                    key={pt.value}
                    onPress={() => setPaymentType(pt.value)}
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
                      {pt.label}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>

          {/* Notes */}
          <View>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Notes (optional)</Text>
            <View style={[styles.inputBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Any additional notes…"
                placeholderTextColor={theme.colors.textFaint}
                multiline
                style={[styles.textArea, { color: theme.colors.text }]}
              />
            </View>
          </View>

          <Button label={submitting ? "Saving…" : "Record Sale"} onPress={handleSave} loading={submitting} />
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
  content: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 50, gap: 20 },
  fieldLabel: { fontSize: 14, fontWeight: "700", marginBottom: 10 },
  selectList: { gap: 8 },
  selectItem: { flexDirection: "row", alignItems: "center", padding: 12, borderWidth: 1, gap: 10 },
  selectTitle: { fontSize: 14, fontWeight: "600" },
  selectSub: { fontSize: 12, marginTop: 1 },
  priceCard: { gap: 8 },
  priceLabel: { fontSize: 12.5, fontWeight: "600", marginBottom: 4 },
  priceRow: { flexDirection: "row", justifyContent: "space-between" },
  priceKey: { fontSize: 13.5 },
  priceVal: { fontSize: 13.5, fontWeight: "600" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "600" },
  inputBox: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  textArea: { fontSize: 14.5, minHeight: 70, textAlignVertical: "top", padding: 0 },
});
