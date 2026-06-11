import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/ui/Text";
import { Badge } from "../../components/ui/Badge";
import {
  getBusinessReservations,
  updateReservationStatus,
  type BusinessReservation,
} from "../../services/reservation";
import type { ReservationStatus } from "../../lib/database.types";
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
  Shadow,
} from "../../lib/constants";

const FILTERS: { label: string; statuses: ReservationStatus[] }[] = [
  { label: "Bekleyen", statuses: ["PENDING"] },
  { label: "Onaylanan", statuses: ["CONFIRMED"] },
  { label: "Gecmis", statuses: ["COMPLETED", "REJECTED", "CANCELLED"] },
];

const STATUS_BADGE: Record<
  string,
  { label: string; variant: "accent" | "eco" | "neutral" | "action" | "amber" }
> = {
  PENDING: { label: "Bekliyor", variant: "amber" },
  CONFIRMED: { label: "Onaylandi", variant: "eco" },
  REJECTED: { label: "Reddedildi", variant: "action" },
  CANCELLED: { label: "Iptal", variant: "neutral" },
  COMPLETED: { label: "Tamamlandi", variant: "accent" },
};

export default function BusinessReservationsScreen() {
  const [filterIdx, setFilterIdx] = useState(0);
  const [reservations, setReservations] = useState<BusinessReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await getBusinessReservations();
      setReservations(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filtered = reservations.filter((r) =>
    FILTERS[filterIdx].statuses.includes(r.status)
  );

  const handleAction = async (
    id: string,
    action: "CONFIRMED" | "REJECTED" | "COMPLETED"
  ) => {
    const labels = {
      CONFIRMED: "Onayla",
      REJECTED: "Reddet",
      COMPLETED: "Tamamlandi",
    };

    Alert.alert(labels[action], `Emin misiniz?`, [
      { text: "Iptal", style: "cancel" },
      {
        text: labels[action],
        onPress: async () => {
          const result = await updateReservationStatus(id, action);
          if ("error" in result) {
            Alert.alert("Hata", result.error);
          } else {
            fetchData();
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      weekday: "short",
    });
  };

  const formatTime = (timeStr: string) => timeStr.slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text variant="heading" style={styles.pageTitle}>
        Rezervasyonlar
      </Text>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f, idx) => {
          const count = reservations.filter((r) =>
            f.statuses.includes(r.status)
          ).length;
          return (
            <TouchableOpacity
              key={f.label}
              style={[
                styles.filterTab,
                idx === filterIdx && styles.filterTabActive,
              ]}
              onPress={() => setFilterIdx(idx)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  idx === filterIdx && styles.filterTabTextActive,
                ]}
              >
                {f.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text variant="muted">Rezervasyon yok</Text>
            </View>
          ) : (
            filtered.map((rez) => {
              const badge = STATUS_BADGE[rez.status] ?? {
                label: rez.status,
                variant: "neutral" as const,
              };
              return (
                <View key={rez.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardName}>
                        {rez.customer.name}
                      </Text>
                      {rez.customer.phone && (
                        <Text variant="muted" style={styles.cardPhone}>
                          {rez.customer.phone}
                        </Text>
                      )}
                    </View>
                    <Badge label={badge.label} variant={badge.variant} />
                  </View>

                  <View style={styles.cardDetails}>
                    <Text style={styles.cardDate}>
                      {formatDate(rez.reservationDate)} - {formatTime(rez.reservationTime)}
                    </Text>
                    <Text variant="muted">
                      {rez.partySize} kisi
                    </Text>
                  </View>

                  {rez.note && (
                    <Text style={styles.cardNote}>Not: {rez.note}</Text>
                  )}

                  {/* Actions */}
                  {rez.status === "PENDING" && (
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnConfirm]}
                        onPress={() => handleAction(rez.id, "CONFIRMED")}
                      >
                        <Text style={styles.actionBtnText}>Onayla</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnReject]}
                        onPress={() => handleAction(rez.id, "REJECTED")}
                      >
                        <Text style={[styles.actionBtnText, { color: Colors.action }]}>
                          Reddet
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {rez.status === "CONFIRMED" && (
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnConfirm]}
                        onPress={() => handleAction(rez.id, "COMPLETED")}
                      >
                        <Text style={styles.actionBtnText}>Tamamlandi</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pageTitle: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterTabText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textSoft,
  },
  filterTabTextActive: {
    color: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  empty: {
    paddingVertical: Spacing.xxl,
    alignItems: "center",
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  cardName: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.text,
  },
  cardPhone: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  cardDate: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
  },
  cardNote: {
    fontSize: FontSize.sm,
    color: Colors.textSoft,
    fontStyle: "italic",
    marginBottom: Spacing.xs,
  },
  cardActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  actionBtnConfirm: {
    backgroundColor: Colors.accent,
  },
  actionBtnReject: {
    backgroundColor: Colors.surface2,
  },
  actionBtnText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.white,
  },
});
