import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { useApp } from "../context/AppContext";
import { Card } from "../components/Card";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/Button";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { CarStatus } from "../data/mockData";
import { RootStackParamList } from "../navigation/types";

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const theme = useTheme();
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
};

export const CarDetailScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "CarDetail">>();
  const { cars, updateCarStatus, appendLog, currentUser } = useApp();

  const car = cars.find((c) => c.id === route.params.carId);

  if (!car) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: theme.colors.textMuted }}>Car not found</Text>
      </SafeAreaView>
    );
  }

  const [status, setStatus] = useState<CarStatus>(car.status);
  const statusOptions: CarStatus[] = ["available", "reserved", "sold"];

  const handleStatusChange = (newStatus: CarStatus) => {
    setStatus(newStatus);
    updateCarStatus(car.id, newStatus);
    appendLog({
      userId: currentUser?.id ?? "",
      userName: currentUser?.name ?? "Unknown",
      action: "updated",
      module: "Cars",
      description: `${car.name} status changed to ${newStatus}`,
      timestamp: "Just now",
      type: "update",
    });
  };

  const handleRecordSale = () => {
    if (car.status === "sold") {
      Alert.alert("Already sold", "This car has already been sold.");
      return;
    }
    navigation.navigate("AddSale", { carId: car.id });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <AnimatedPressable onPress={() => navigation.goBack()} scaleTo={0.9} haptic={false}>
          <View style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </View>
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {car.name}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card sheen style={styles.heroCard}>
          <View
            style={[
              styles.heroIconWrap,
              { backgroundColor: theme.colors.accentMuted, borderRadius: theme.radius.lg },
            ]}
          >
            <Ionicons name="car-sport" size={36} color={theme.colors.accent} />
          </View>
          <Text style={[styles.heroName, { color: theme.colors.text }]}>{car.name}</Text>
          <Text style={[styles.heroMeta, { color: theme.colors.textMuted }]}>
            {car.year} · {car.color}
          </Text>
          <StatusBadge status={status} />
        </Card>

        <View>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Update status</Text>
          <View style={styles.statusRow}>
            {statusOptions.map((opt) => {
              const isActive = opt === status;
              return (
                <AnimatedPressable
                  key={opt}
                  onPress={() => handleStatusChange(opt)}
                  scaleTo={0.95}
                  style={[
                    styles.statusOption,
                    {
                      backgroundColor: isActive ? theme.colors.accent : theme.colors.surface,
                      borderColor: isActive ? theme.colors.accent : theme.colors.border,
                      borderRadius: theme.radius.md,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      { color: isActive ? (theme.mode === "dark" ? "#0B0D10" : "#FFFFFF") : theme.colors.textMuted },
                    ]}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>
        </View>

        <View>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Vehicle details</Text>
          <Card sheen padded={false} style={{ paddingHorizontal: theme.spacing(4) }}>
            <DetailRow label="Brand" value={car.brand} />
            <DetailRow label="Model" value={car.model} />
            <DetailRow label="Year" value={car.year} />
            <DetailRow label="Color" value={car.color} />
            <DetailRow label="Registration No." value={car.registrationNumber || "—"} />
            <DetailRow label="Chassis No." value={car.chassisNumber || "—"} />
            <DetailRow label="Engine No." value={car.engineNumber || "—"} />
          </Card>
        </View>

        <View>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pricing</Text>
          <Card sheen padded={false} style={{ paddingHorizontal: theme.spacing(4) }}>
            <DetailRow label="Purchase price" value={car.purchasePrice} />
            <DetailRow label="Sale price" value={car.salePrice} />
            <DetailRow
              label="Margin"
              value={`Rs ${(car.salePriceNum - car.purchasePriceNum).toLocaleString("en-PK")}`}
            />
          </Card>
        </View>

        {car.status !== "sold" && (
          <Button label="Record Sale" onPress={handleRecordSale} />
        )}
      </ScrollView>
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
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 22,
  },
  heroCard: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 28,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  heroName: {
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
  },
  heroMeta: {
    fontSize: 13.5,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 11,
    alignItems: "center",
    borderWidth: 1,
  },
  statusOptionText: {
    fontSize: 13.5,
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 13.5,
  },
  detailValue: {
    fontSize: 13.5,
    fontWeight: "600",
  },
});
