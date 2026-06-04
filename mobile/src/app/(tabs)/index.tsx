import { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  RefreshControl,
  View,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Text } from "../../components/ui/Text";
import { CampaignCard } from "../../components/CampaignCard";
import { CategoryPills } from "../../components/CategoryPills";
import { getActiveCampaigns } from "../../services/campaign";
import { mockCampaigns, MockCampaign } from "../../lib/mock-campaigns";
import { Colors, Spacing } from "../../lib/constants";

export default function HomeScreen() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<MockCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("ALL");

  const fetchCampaigns = useCallback(async () => {
    try {
      const data = await getActiveCampaigns();
      setCampaigns(data.length > 0 ? data : mockCampaigns);
    } catch {
      setCampaigns(mockCampaigns);
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

  const filteredCampaigns =
    activeCategory === "ALL"
      ? campaigns
      : campaigns.filter((c) => c.business.category === activeCategory);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.blue} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredCampaigns}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.hero}>
              <Text variant="title" style={styles.heroTitle}>
                Simdi, burada, yari fiyatina
              </Text>
              <Text variant="caption" style={styles.heroSubtitle}>
                Yakinindaki firsatlari kesfe et, surpriz paketleri yakala
              </Text>
            </View>
            <CategoryPills
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />
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
            tintColor={Colors.blue}
          />
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
  header: {
    marginBottom: Spacing.md,
  },
  hero: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 32,
  },
  heroSubtitle: {
    marginTop: Spacing.xs,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  separator: {
    height: 12,
  },
});
