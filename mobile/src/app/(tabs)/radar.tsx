import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ScrollView,
  RefreshControl,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text } from "../../components/ui/Text";
import { RadarView } from "../../components/RadarView";
import { SmartFilters, type SmartFilterKey } from "../../components/SmartFilters";
import { VibrantCampaignCard } from "../../components/VibrantCampaignCard";
import { useUserLocation } from "../../hooks/useUserLocation";
import { haversineDistance } from "../../lib/geo";
import { getActiveCampaigns } from "../../services/campaign";
import { mockCampaigns, type MockCampaign } from "../../lib/mock-campaigns";
import { Colors, Spacing, FontSize } from "../../lib/constants";

const KADIKOY_CENTER = { latitude: 40.9884, longitude: 29.029 };
const FALLBACK_RANGE = 1500; // If user is >1.5km from nearest business, use demo center

export default function RadarScreen() {
  const router = useRouter();
  const { location, loading: locationLoading } = useUserLocation();
  const [campaigns, setCampaigns] = useState<MockCampaign[]>(mockCampaigns);
  const [activeFilters, setActiveFilters] = useState<Set<SmartFilterKey>>(
    new Set()
  );
  const [refreshing, setRefreshing] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      const data = await getActiveCampaigns();
      setCampaigns(data.length > 0 ? data : mockCampaigns);
    } catch {
      setCampaigns(mockCampaigns);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const toggleFilter = useCallback((key: SmartFilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Smart center: if user is far from all businesses, fall back to Kadıköy
  const center = useMemo(() => {
    if (!location) return KADIKOY_CENTER;
    const nearest = Math.min(
      ...campaigns.map((c) =>
        haversineDistance(location, {
          latitude: c.business.latitude,
          longitude: c.business.longitude,
        })
      )
    );
    return nearest > FALLBACK_RANGE ? KADIKOY_CENTER : location;
  }, [location, campaigns]);

  const filteredCampaigns = useMemo(() => {
    let result = campaigns.filter(
      (c) => c.endsAt.getTime() - Date.now() > 0
    );

    if (activeFilters.has("WALKING")) {
      result = result.filter((c) => {
        const dist = haversineDistance(center, {
          latitude: c.business.latitude,
          longitude: c.business.longitude,
        });
        return dist <= 1000; // ~12 min walk
      });
    }

    if (activeFilters.has("CLOSING_SOON")) {
      result = result.filter((c) => {
        const timeLeft = c.endsAt.getTime() - Date.now();
        return timeLeft <= 2 * 60 * 60_000; // 2 hours
      });
    }

    if (activeFilters.has("SURPRISE")) {
      result = result.filter((c) => c.isSurprisePackage);
    }

    return result;
  }, [campaigns, activeFilters, center]);

  if (locationLoading && !location) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.neonBlue} />
        <Text style={styles.loadingText}>Konum alınıyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.neonBlue}
          />
        }
      >
        {/* Radar */}
        <RadarView
          campaigns={campaigns}
          userLocation={location}
          locationLoading={locationLoading}
        />

        {/* Smart Filters */}
        <SmartFilters
          activeFilters={activeFilters}
          onToggle={toggleFilter}
        />

        {/* Feed Header */}
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>Yakınındaki Fırsatlar</Text>
          <Text style={styles.feedCount}>
            {filteredCampaigns.length} kampanya
          </Text>
        </View>

        {/* Campaign Cards */}
        {filteredCampaigns.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>
              Bu filtrelere uygun kampanya bulunamadı
            </Text>
          </View>
        ) : (
          filteredCampaigns.map((campaign) => (
            <VibrantCampaignCard
              key={campaign.id}
              campaign={campaign}
              onPress={() => router.push(`/campaign/${campaign.id}`)}
            />
          ))
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
    backgroundColor: Colors.bg,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSize.sm,
    color: Colors.textMute,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  feedTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  feedCount: {
    fontSize: FontSize.sm,
    color: Colors.neonBlue,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.base,
    color: Colors.textMute,
    textAlign: "center",
  },
});
