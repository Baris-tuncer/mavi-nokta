import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Text } from "../../components/ui/Text";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../providers/AuthProvider";
import { getMyBusiness } from "../../services/business";
import { listMyCampaigns } from "../../services/campaign";
import { categoryMeta } from "../../lib/mock-campaigns";
import { formatPrice } from "../../lib/utils";
import type { Business, Campaign, CampaignStatus } from "../../lib/database.types";
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
} from "../../lib/constants";

const STATUS_VARIANT: Record<string, "blue" | "amber" | "neutral"> = {
  ACTIVE: "blue",
  DRAFT: "amber",
};

function statusVariant(status: CampaignStatus) {
  return STATUS_VARIANT[status] ?? "neutral";
}

export default function DashboardScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [biz, camps] = await Promise.all([
          getMyBusiness(),
          listMyCampaigns(),
        ]);
        if (mounted) {
          setBusiness(biz as Business | null);
          setCampaigns((camps ?? []) as Campaign[]);
        }
      } catch {
        // Silently handle fetch errors
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Auth guard
  if (profile?.role !== "BUSINESS") {
    return (
      <View style={styles.guardContainer}>
        <Text variant="heading" style={styles.guardTitle}>
          Erisim Engellendi
        </Text>
        <Text variant="caption" style={styles.guardText}>
          Bu sayfa sadece isletme hesaplarina aciktir.
        </Text>
        <Link href="/(auth)/business-login" asChild>
          <TouchableOpacity style={styles.guardLink}>
            <Text style={styles.guardLinkText}>Isletme Girisi</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.blue} />
      </View>
    );
  }

  // No business registered yet
  if (!business) {
    return (
      <View style={styles.guardContainer}>
        <Text variant="heading" style={styles.guardTitle}>
          Isletme bilgilerin eksik
        </Text>
        <Text variant="caption" style={styles.guardText}>
          Kampanya olusturmak icin once isletme kaydini tamamla.
        </Text>
        <Link href="/(auth)/business-login" asChild>
          <TouchableOpacity style={styles.guardLink}>
            <Text style={styles.guardLinkText}>Kayit Ol</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  const meta =
    categoryMeta[business.category as keyof typeof categoryMeta] ?? null;

  const activeCount = campaigns.filter((c) => c.status === "ACTIVE").length;
  const draftCount = campaigns.filter((c) => c.status === "DRAFT").length;
  const expiredCount = campaigns.filter(
    (c) => c.status === "EXPIRED" || c.status === "SOLD_OUT"
  ).length;

  function renderCampaignCard({ item }: { item: Campaign }) {
    const discount = Math.round(
      ((item.old_price - item.new_price) / item.old_price) * 100
    );

    return (
      <Card style={styles.campaignCard}>
        <View style={styles.campaignHeader}>
          <Badge
            label={item.status}
            variant={statusVariant(item.status)}
          />
          {item.remaining_stock != null && (
            <Text variant="muted">
              {item.remaining_stock} / {item.total_stock} kaldi
            </Text>
          )}
        </View>
        <Text style={styles.campaignSlogan} numberOfLines={2}>
          {item.slogan}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.oldPrice}>{formatPrice(item.old_price)}</Text>
          <Text style={styles.newPrice}>{formatPrice(item.new_price)}</Text>
          <Badge label={`%${discount}`} variant="magenta" />
        </View>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={campaigns}
        keyExtractor={(item) => item.id}
        renderItem={renderCampaignCard}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Business Header */}
            <View style={styles.header}>
              <Text variant="title">{business.name}</Text>
              <View style={styles.metaRow}>
                {meta && (
                  <Badge
                    label={`${meta.emoji} ${meta.label}`}
                    variant="blue"
                  />
                )}
                <Text variant="caption" style={styles.location}>
                  {business.city}, {business.district}
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <StatCard label="Aktif" count={activeCount} color={Colors.blue} />
              <StatCard label="Taslak" count={draftCount} color={Colors.amber} />
              <StatCard
                label="Bitmis"
                count={expiredCount}
                color={Colors.textMute}
              />
            </View>

            {/* New Campaign Button */}
            <Button
              title="Yeni Kampanya"
              variant="secondary"
              onPress={() => router.push("/(business)/new-campaign")}
              style={styles.newCampaignBtn}
            />

            {/* Section Title */}
            <Text variant="label" style={styles.sectionTitle}>
              Kampanyalar
            </Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="caption">Henuz kampanya olusturmadiniz.</Text>
          </View>
        }
      />
    </View>
  );
}

function StatCard({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <Card style={styles.statCard}>
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text variant="muted">{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bg,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  location: {
    marginLeft: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  statCount: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
  },
  newCampaignBtn: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  campaignCard: {
    marginBottom: Spacing.sm,
  },
  campaignHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  campaignSlogan: {
    fontSize: FontSize.base,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  oldPrice: {
    fontSize: FontSize.sm,
    color: Colors.textMute,
    textDecorationLine: "line-through",
  },
  newPrice: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.blue,
  },
  // Guard screens
  guardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bg,
    padding: Spacing.xl,
  },
  guardTitle: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  guardText: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  guardLink: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.blue,
  },
  guardLinkText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: FontSize.base,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
  },
});
