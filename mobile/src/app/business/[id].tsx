import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { ChevronLeft, MapPin, Phone, Calendar, Award } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/ui/Text";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { VibrantCampaignCard } from "../../components/VibrantCampaignCard";
import { supabase } from "../../lib/supabase";
import { categoryMeta } from "../../lib/mock-campaigns";
import { useAuth } from "../../providers/AuthProvider";
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
  Shadow,
} from "../../lib/constants";
import type { Business } from "../../lib/database.types";
import type { MockCampaign } from "../../lib/mock-campaigns";

type BusinessDetail = Business & {
  loyalty_programs?: Array<{
    id: string;
    stamp_target: number;
    reward_text: string;
    is_active: boolean;
  }>;
};

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [campaigns, setCampaigns] = useState<MockCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select(
          `*, loyalty_programs ( id, stamp_target, reward_text, is_active )`
        )
        .eq("id", id)
        .single();

      if (biz) setBusiness(biz as any);

      // Fetch active campaigns
      const { data: camps } = await supabase
        .from("campaigns")
        .select(
          `id, slogan, title, description, image_url,
           old_price, new_price, starts_at, ends_at,
           total_stock, remaining_stock, is_surprise_package,
           businesses!inner ( id, name, slug, category, city, district, address, latitude, longitude, logo_url )`
        )
        .eq("business_id", id)
        .eq("status", "ACTIVE")
        .gt("ends_at", new Date().toISOString())
        .order("ends_at", { ascending: true });

      if (camps) {
        setCampaigns(
          camps.map((row: any) => {
            const b = Array.isArray(row.businesses)
              ? row.businesses[0]
              : row.businesses;
            return {
              id: row.id,
              slug: row.id,
              slogan: row.slogan,
              title: row.title,
              description: row.description || "",
              imageUrl:
                row.image_url ||
                "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
              oldPrice: Number(row.old_price),
              newPrice: Number(row.new_price),
              startsAt: new Date(row.starts_at),
              endsAt: new Date(row.ends_at),
              totalStock: row.total_stock,
              remainingStock: row.remaining_stock,
              isSurprisePackage: row.is_surprise_package,
              business: {
                name: b.name,
                slug: b.slug,
                category: b.category,
                city: b.city,
                district: b.district,
                address: b.address,
                latitude: Number(b.latitude),
                longitude: Number(b.longitude),
                logoUrl:
                  b.logo_url ||
                  "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=96&q=80",
              },
            } satisfies MockCampaign;
          })
        );
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!business) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text variant="heading">Isletme bulunamadi</Text>
          <Button
            title="Geri Don"
            variant="ghost"
            onPress={() => router.back()}
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const meta = categoryMeta[business.category] ?? {
    emoji: "",
    label: business.category,
  };
  const loyaltyProgram = business.loyalty_programs?.find((p) => p.is_active);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Business Info Card */}
        <View style={styles.bizCard}>
          <Image
            source={
              business.logo_url ||
              "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=96&q=80"
            }
            style={styles.bizLogo}
            contentFit="cover"
          />
          <Text variant="heading" style={styles.bizName}>
            {business.name}
          </Text>
          <Badge
            label={`${meta.emoji} ${meta.label}`}
            variant="accent"
          />

          <View style={styles.infoRow}>
            <MapPin size={14} color={Colors.textMute} />
            <Text variant="muted" style={styles.infoText}>
              {business.district}, {business.city}
            </Text>
          </View>
          {business.address && (
            <Text variant="caption" style={styles.addressText}>
              {business.address}
            </Text>
          )}
          {business.phone && (
            <View style={styles.infoRow}>
              <Phone size={14} color={Colors.textMute} />
              <Text variant="muted" style={styles.infoText}>
                {business.phone}
              </Text>
            </View>
          )}
        </View>

        {/* Reservation Button */}
        {business.reservation_enabled && (
          <Button
            title="Rezervasyon Yap"
            variant="primary"
            onPress={() => {
              if (!user) {
                router.push("/(auth)/customer-login");
                return;
              }
              router.push(`/reserve/${business.id}`);
            }}
            style={styles.rezButton}
          />
        )}

        {/* Loyalty Card */}
        {loyaltyProgram && (
          <View style={styles.loyaltySection}>
            <View style={styles.loyaltySectionHeader}>
              <Award size={18} color={Colors.accent} />
              <Text style={styles.loyaltySectionTitle}>Sadakat Programi</Text>
            </View>
            <View style={styles.loyaltyInfoCard}>
              <Text style={styles.loyaltyReward}>
                {loyaltyProgram.reward_text}
              </Text>
              <Text variant="muted" style={styles.loyaltyTarget}>
                {loyaltyProgram.stamp_target} damgada 1 odul
              </Text>
            </View>
          </View>
        )}

        {/* Active Campaigns */}
        {campaigns.length > 0 && (
          <View style={styles.campaignsSection}>
            <Text style={styles.sectionTitle}>Aktif Kampanyalar</Text>
            {campaigns.map((camp) => (
              <VibrantCampaignCard
                key={camp.id}
                campaign={camp}
                onPress={() => router.push(`/campaign/${camp.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
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
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  bizCard: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  bizLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface2,
    marginBottom: Spacing.md,
  },
  bizName: {
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing.sm,
  },
  infoText: {
    fontSize: FontSize.sm,
  },
  addressText: {
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: Spacing.lg,
  },
  rezButton: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  loyaltySection: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  loyaltySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  loyaltySectionTitle: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.text,
  },
  loyaltyInfoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  loyaltyReward: {
    fontSize: FontSize.base,
    fontWeight: "600",
    color: Colors.accent,
    marginBottom: 4,
  },
  loyaltyTarget: {
    fontSize: FontSize.sm,
  },
  campaignsSection: {
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
});
