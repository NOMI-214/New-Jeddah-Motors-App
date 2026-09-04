import React, { useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { useApp } from "../context/AppContext";
import { Card } from "../components/Card";
import { SearchBar } from "../components/SearchBar";
import { AnimatedPressable } from "../components/AnimatedPressable";
import { AuditLog } from "../data/mockData";

const typeIcon: Record<AuditLog["type"], keyof typeof Ionicons.glyphMap> = {
  create: "add-circle-outline",
  update: "create-outline",
  delete: "trash-outline",
  auth: "log-in-outline",
  view: "eye-outline",
};

const typeColor = (type: AuditLog["type"], theme: ReturnType<typeof useTheme>): string => ({
  create: theme.colors.success,
  update: theme.colors.steel,
  delete: theme.colors.danger,
  auth: theme.colors.accent,
  view: theme.colors.textMuted,
}[type]);

const MODULE_FILTERS = ["All", "Cars", "Customers", "Transactions", "Expenses", "Sales", "Users", "Auth"];

export const AuditLogsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { auditLogs } = useApp();
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");

  const filtered = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesModule = moduleFilter === "All" || log.module === moduleFilter;
      const matchesQuery =
        !query.trim() ||
        log.description.toLowerCase().includes(query.toLowerCase()) ||
        log.userName.toLowerCase().includes(query.toLowerCase()) ||
        log.module.toLowerCase().includes(query.toLowerCase());
      return matchesModule && matchesQuery;
    });
  }, [auditLogs, query, moduleFilter]);

  const renderLog = ({ item }: { item: AuditLog }) => {
    const color = typeColor(item.type, theme);
    const icon = typeIcon[item.type];
    return (
      <Card sheen style={styles.card}>
        <View style={[styles.iconWrap, { backgroundColor: `${color}18`, borderRadius: theme.radius.pill }]}>
          <Ionicons name={icon} size={16} color={color} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.description, { color: theme.colors.text }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.moduleTag, { backgroundColor: theme.colors.surfaceRaised, borderRadius: theme.radius.pill }]}>
              <Text style={[styles.moduleText, { color: theme.colors.textMuted }]}>{item.module}</Text>
            </View>
            <Text style={[styles.user, { color: theme.colors.textFaint }]}>· {item.userName}</Text>
            <Text style={[styles.time, { color: theme.colors.textFaint }]}>· {item.timestamp}</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <View style={[styles.headerSection, { gap: theme.spacing(3) }]}>
        <View style={styles.titleRow}>
          <AnimatedPressable onPress={() => navigation.goBack()} scaleTo={0.9} haptic={false}>
            <View style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
            </View>
          </AnimatedPressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Audit Logs</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              {auditLogs.length} total entries
            </Text>
          </View>
        </View>

        <SearchBar value={query} onChangeText={setQuery} placeholder="Search logs…" />

        {/* Module filter chips */}
        <View style={styles.filterRow}>
          {MODULE_FILTERS.map((mod) => {
            const isActive = mod === moduleFilter;
            return (
              <AnimatedPressable
                key={mod}
                onPress={() => setModuleFilter(mod)}
                scaleTo={0.95}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? theme.colors.accent : theme.colors.surface,
                    borderColor: isActive ? theme.colors.accent : theme.colors.border,
                    borderRadius: theme.radius.pill,
                  },
                ]}
              >
                <Text style={[styles.filterText, { color: isActive ? (theme.mode === "dark" ? "#0B0D10" : "#FFF") : theme.colors.textMuted }]}>
                  {mod}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderLog}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={28} color={theme.colors.textFaint} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>No logs found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerSection: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 14 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  subtitle: { fontSize: 12.5, marginTop: 1 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: "600" },
  list: { paddingHorizontal: 18, paddingBottom: 32 },
  card: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 },
  iconWrap: { width: 34, height: 34, alignItems: "center", justifyContent: "center", marginTop: 2 },
  info: { flex: 1, gap: 6 },
  description: { fontSize: 13.5, fontWeight: "500", lineHeight: 19 },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4 },
  moduleTag: { paddingHorizontal: 8, paddingVertical: 2 },
  moduleText: { fontSize: 11, fontWeight: "600" },
  user: { fontSize: 11.5 },
  time: { fontSize: 11.5 },
  empty: { alignItems: "center", gap: 10, paddingTop: 80 },
});
