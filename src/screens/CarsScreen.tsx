import React, { useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { useApp } from "../context/AppContext";
import { Card } from "../components/Card";
import { SearchBar } from "../components/SearchBar";
import { FilterChips } from "../components/FilterChips";
import { StatusBadge } from "../components/StatusBadge";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { Button } from "../components/Button";
import { Car, CarStatus } from "../data/mockData";
import { RootStackParamList } from "../navigation/types";

type Filter = CarStatus | "all";

const filterOptions: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
];

export const CarsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { cars } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchesFilter = filter === "all" || car.status === filter;
      const matchesQuery =
        query.trim().length === 0 ||
        car.name.toLowerCase().includes(query.toLowerCase()) ||
        car.registrationNumber.toLowerCase().includes(query.toLowerCase()) ||
        car.brand.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [query, filter, cars]);

  const counts = useMemo(() => ({
    available: cars.filter((c) => c.status === "available").length,
    reserved: cars.filter((c) => c.status === "reserved").length,
    sold: cars.filter((c) => c.status === "sold").length,
  }), [cars]);

  const renderCar = ({ item }: { item: Car }) => (
    <AnimatedPressable
      onPress={() => navigation.navigate("CarDetail", { carId: item.id })}
      scaleTo={0.98}
    >
      <Card sheen style={styles.carCard}>
        <View style={styles.carRow}>
          <View
            style={[
              styles.carIconWrap,
              { backgroundColor: theme.colors.accentMuted, borderRadius: theme.radius.md },
            ]}
          >
            <Ionicons name="car-sport" size={22} color={theme.colors.accent} />
          </View>
          <View style={styles.carInfo}>
            <Text style={[styles.carName, { color: theme.colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.carMeta, { color: theme.colors.textMuted }]} numberOfLines={1}>
              {item.year} · {item.color} · {item.registrationNumber}
            </Text>
            <View style={{ marginTop: 6 }}>
              <StatusBadge status={item.status} />
            </View>
          </View>
          <View style={styles.priceWrap}>
            <Text style={[styles.price, { color: theme.colors.text }]}>{item.salePrice}</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textFaint} />
          </View>
        </View>
      </Card>
    </AnimatedPressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <View style={[styles.headerSection, { gap: theme.spacing(3) }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Inventory</Text>
          <Button
            label="+ Add Car"
            style={{ paddingVertical: 8, paddingHorizontal: 14 }}
            onPress={() => navigation.navigate("AddCar")}
          />
        </View>

        {/* Count row */}
        <View style={styles.countRow}>
          {[
            { label: "Available", count: counts.available, color: theme.colors.success },
            { label: "Reserved", count: counts.reserved, color: theme.colors.warning },
            { label: "Sold", count: counts.sold, color: theme.colors.textFaint },
          ].map((item) => (
            <View key={item.label} style={styles.countItem}>
              <Text style={[styles.countNum, { color: item.color }]}>{item.count}</Text>
              <Text style={[styles.countLabel, { color: theme.colors.textMuted }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        <SearchBar value={query} onChangeText={setQuery} placeholder="Search by model or reg. number" />
        <FilterChips options={filterOptions} selected={filter} onSelect={setFilter} />
      </View>

      <FlatList
        data={filteredCars}
        keyExtractor={(item) => item.id}
        renderItem={renderCar}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={28} color={theme.colors.textFaint} />
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              No cars match your search
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  countRow: {
    flexDirection: "row",
    gap: 20,
  },
  countItem: {
    alignItems: "center",
    gap: 2,
  },
  countNum: {
    fontSize: 20,
    fontWeight: "700",
  },
  countLabel: {
    fontSize: 11.5,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  carCard: {
    padding: 14,
  },
  carRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  carIconWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  carInfo: {
    flex: 1,
  },
  carName: {
    fontSize: 15.5,
    fontWeight: "700",
  },
  carMeta: {
    fontSize: 12.5,
    marginTop: 2,
  },
  priceWrap: {
    alignItems: "flex-end",
    gap: 6,
    paddingTop: 2,
  },
  price: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    gap: 10,
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 14,
  },
});
