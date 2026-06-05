import { useEffect, useState, useCallback, useRef } from "react";
import {
  FlatList,
  RefreshControl,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Animated,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Text } from "../../components/ui/Text";
import { CampaignCard } from "../../components/CampaignCard";
import { getActiveCampaigns } from "../../services/campaign";
import {
  mockCampaigns,
  MockCampaign,
  categoryMeta,
  MockCategory,
} from "../../lib/mock-campaigns";
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from "../../lib/constants";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

/* ═══════════════════════════════════════════
   Unsplash
   ═══════════════════════════════════════════ */
const SPLASH_IMG =
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1080&q=85&auto=format&fit=crop";
const HERO_IMG =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&auto=format&fit=crop";

/* ═══════════════════════════════════════════
   Category pills
   ═══════════════════════════════════════════ */
type Filter = "ALL" | MockCategory;

const PILL_DATA: { key: Filter; label: string; img: string }[] = [
  {
    key: "ALL",
    label: "Tümü",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=120&q=80&auto=format&fit=crop",
  },
  {
    key: "CAFE",
    label: "Cafe",
    img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=120&q=80&auto=format&fit=crop",
  },
  {
    key: "RESTAURANT",
    label: "Restoran",
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=120&q=80&auto=format&fit=crop",
  },
  {
    key: "BAKERY",
    label: "Fırın",
    img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=120&q=80&auto=format&fit=crop",
  },
  {
    key: "MARKET",
    label: "Market",
    img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&q=80&auto=format&fit=crop",
  },
  {
    key: "PUB",
    label: "Pub",
    img: "https://images.unsplash.com/photo-1568644396922-5c3bfae12521?w=120&q=80&auto=format&fit=crop",
  },
  {
    key: "PHARMACY",
    label: "Eczane",
    img: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=120&q=80&auto=format&fit=crop",
  },
  {
    key: "PETSHOP",
    label: "Pet Shop",
    img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=120&q=80&auto=format&fit=crop",
  },
];

/* ═══════════════════════════════════════════
   Home Screen
   ═══════════════════════════════════════════ */
export default function HomeScreen() {
  const router = useRouter();

  /* ── Splash state ── */
  const [splashDone, setSplashDone] = useState(false);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const splashTextOpacity = useRef(new Animated.Value(0)).current;

  /* ── Feed state ── */
  const [campaigns, setCampaigns] = useState<MockCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Filter>("ALL");

  /* Splash animation: text fades in → wait → splash fades out */
  useEffect(() => {
    Animated.timing(splashTextOpacity, {
      toValue: 1,
      duration: 800,
      delay: 400,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setSplashDone(true));
    }, 2800);

    return () => clearTimeout(timer);
  }, [splashOpacity, splashTextOpacity]);

  /* Fetch campaigns */
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

  const filtered =
    activeFilter === "ALL"
      ? campaigns
      : campaigns.filter((c) => c.business.category === activeFilter);

  const activeCampaignCount = campaigns.filter(
    (c) => !c.isSurprisePackage
  ).length;

  /* ═══════════════════════════════════════════
     SPLASH SCREEN — full-screen single photo
     ═══════════════════════════════════════════ */
  if (!splashDone) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" />
        <Image
          source={{ uri: SPLASH_IMG }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          priority="high"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.75)"]}
          style={StyleSheet.absoluteFillObject}
        />

        <Animated.View
          style={[styles.splashContent, { opacity: splashTextOpacity }]}
        >
          <View style={styles.splashLogo}>
            <View style={styles.splashLogoDot} />
          </View>
          <Text style={styles.splashBrand}>Mavi Nokta</Text>
          <Text style={styles.splashSlogan}>
            Çevrendeki anlık fırsatları keşfet.
          </Text>
        </Animated.View>

        {/* Fade-out overlay — transitions to light bg */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: Colors.bg,
              opacity: Animated.subtract(1, splashOpacity).interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ]}
          pointerEvents="none"
        />
      </View>
    );
  }

  /* ═══════════════════════════════════════════
     FEED — main content
     ═══════════════════════════════════════════ */
  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={Colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            {/* ── Hero banner ── */}
            <View style={styles.heroWrap}>
              <Image
                source={{ uri: HERO_IMG }}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
              />
              <LinearGradient
                colors={[
                  "transparent",
                  "rgba(0,0,0,0.25)",
                  "rgba(0,0,0,0.7)",
                ]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>
                  Çevrendeki{"\n"}anlık fırsatlar,{"\n"}
                  <Text style={styles.heroAccent}>tek noktada.</Text>
                </Text>
                <Text style={styles.heroSub}>
                  {activeCampaignCount} aktif kampanya seni bekliyor
                </Text>
              </View>
            </View>

            {/* ── Category pills ── */}
            <FlatList
              data={PILL_DATA}
              keyExtractor={(item) => item.key}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillsRow}
              renderItem={({ item }) => {
                const isActive = activeFilter === item.key;
                return (
                  <TouchableOpacity
                    style={[
                      styles.pill,
                      isActive ? styles.pillActive : styles.pillInactive,
                    ]}
                    onPress={() => setActiveFilter(item.key)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: item.img }}
                      style={styles.pillImg}
                      contentFit="cover"
                    />
                    <Text
                      style={[
                        styles.pillLabel,
                        isActive
                          ? styles.pillLabelActive
                          : styles.pillLabelInactive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            {/* ── Section heading ── */}
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Aktif Fırsatlar</Text>
              <Text style={styles.sectionSub}>
                Kaçırmadan yakala — süresi en kısa olanlar üstte
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <CampaignCard
            campaign={item}
            onPress={() => router.push(`/campaign/${item.id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

/* ═══════════════════════════════════════════
   Styles
   ═══════════════════════════════════════════ */
const styles = StyleSheet.create({
  /* Splash — dark (photo-based, intentional) */
  splashContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  splashContent: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingBottom: SCREEN_H * 0.15,
  },
  splashLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1F6BFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  splashLogoDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  splashBrand: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  splashSlogan: {
    fontSize: 16,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    paddingHorizontal: 40,
  },

  /* Layout — Apple white */
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

  /* Hero */
  heroWrap: {
    width: SCREEN_W,
    height: 320,
    position: "relative",
    overflow: "hidden",
  },
  heroContent: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  heroAccent: {
    color: "#93C5FD",
  },
  heroSub: {
    marginTop: Spacing.sm,
    fontSize: FontSize.sm,
    color: "rgba(255,255,255,0.7)",
  },

  /* Pills */
  pillsRow: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: BorderRadius.full,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 16,
  },
  pillActive: {
    backgroundColor: Colors.text,
    ...Shadow.sm,
  },
  pillInactive: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  pillLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  pillLabelActive: {
    color: Colors.white,
  },
  pillLabelInactive: {
    color: Colors.textSoft,
  },

  /* Section */
  sectionHead: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: FontSize.sm,
    color: Colors.textMute,
    marginTop: 4,
  },

  /* List */
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sep: {
    height: 20,
  },
});
