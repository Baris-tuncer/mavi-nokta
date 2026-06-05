import { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  RefreshControl,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Gift, Leaf } from "lucide-react-native";
import { Text } from "../../components/ui/Text";
import { CampaignCard } from "../../components/CampaignCard";
import { getActiveCampaigns } from "../../services/campaign";
import { mockCampaigns, MockCampaign } from "../../lib/mock-campaigns";
import { Colors, Spacing, BorderRadius } from "../../lib/constants";

export default function SurpriseScreen() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<MockCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      const data = await getActiveCampaigns();
      const all = data.length > 0 ? data : mockCampaigns;
      setCampaigns(all.filter((c) => c.isSurprisePackage === true));
    } catch {
      setCampaigns(mockCampaigns.filter((c) => c.isSurprisePackage === true));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCampaigns();
  }, [fetchCampaigns]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.eco} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={campaigns}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.banner}>
            <View style={styles.bannerIconRow}>
              <Gift size={28} color={Colors.white} />
              <Leaf size={20} color={Colors.white} style={styles.leafIcon} />
            </View>
            <Text variant="heading" style={styles.bannerTitle}>
              Sürpriz Paketler
            </Text>
            <Text style={styles.bannerSubtitle}>
              İşletmelerin gün sonunda kalan ürünlerinden oluşturulan sürpriz
              paketler. Hem tasarruf et, hem sıfır atığa destek ol!
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <CampaignCard
            campaign={item}
            onPress={() => router.push(`/campaign/${item.id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.eco}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Gift size={48} color={Colors.textMute} />
            <Text variant="muted" style={styles.emptyText}>
              Henüz sürpriz paket yok
            </Text>
            <Text variant="caption" style={styles.emptySubtext}>
              İşletmeler yeni paketler eklediğinde burada görünecek
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
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
  },
  banner: {
    backgroundColor: Colors.eco,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  bannerIconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  leafIcon: {
    marginLeft: Spacing.xs,
  },
  bannerTitle: {
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  bannerSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  separator: {
    height: 16,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    marginTop: Spacing.xs,
    textAlign: "center",
  },
});
