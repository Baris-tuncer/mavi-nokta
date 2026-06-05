import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Image } from "expo-image";
import {
  Plus,
  Clock,
  Gift,
  OctagonX,
  RotateCcw,
  Eye,
  Users,
  TrendingUp,
  MapPin,
  ChevronRight,
} from "lucide-react-native";
import { Text } from "../../components/ui/Text";
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

const { width: SCREEN_W } = Dimensions.get("window");

/* ── Unsplash Images ── */
const IMG = {
  hero: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=900&q=80",
  cta: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=80",
  statActive:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
  statPeople:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80",
  statViews:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
  empty:
    "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=800&q=80",
};

const CAMPAIGN_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1567171466295-4afa63d45416?w=800&q=80",
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
  "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=800&q=80",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80",
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80",
];

function getCampaignImage(c: Campaign, index: number): string {
  if (c.image_url) return c.image_url;
  return CAMPAIGN_FALLBACK_IMAGES[index % CAMPAIGN_FALLBACK_IMAGES.length];
}

/* ── Demo data ── */
const DEMO_BUSINESS = {
  id: "demo",
  name: "Caferağa Pastanesi",
  category: "BAKERY",
  city: "İstanbul",
  district: "Kadıköy",
} as Business;

const now = Date.now();
const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: "d1",
    business_id: "demo",
    slogan: "Taze Çıktı! Balkabaklı Cheesecake yarı fiyatına",
    title: "Balkabaklı Cheesecake",
    description: "",
    image_url:
      "https://images.unsplash.com/photo-1567171466295-4afa63d45416?w=800&q=80",
    old_price: 180,
    new_price: 99,
    currency: "TRY",
    starts_at: new Date(now - 60 * 60_000).toISOString(),
    ends_at: new Date(now + 45 * 60_000).toISOString(),
    total_stock: 20,
    remaining_stock: 8,
    per_user_limit: 1,
    is_surprise_package: false,
    surprise_hint: null,
    status: "ACTIVE" as CampaignStatus,
    created_at: "",
    updated_at: "",
  },
  {
    id: "d2",
    business_id: "demo",
    slogan: "Gün sonu sürpriz pasta paketi — ne çıkarsa bahtına!",
    title: "Sürpriz Pasta Paketi",
    description: "",
    image_url:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
    old_price: 250,
    new_price: 89,
    currency: "TRY",
    starts_at: new Date(now - 30 * 60_000).toISOString(),
    ends_at: new Date(now + 90 * 60_000).toISOString(),
    total_stock: 10,
    remaining_stock: 3,
    per_user_limit: 1,
    is_surprise_package: true,
    surprise_hint: null,
    status: "ACTIVE" as CampaignStatus,
    created_at: "",
    updated_at: "",
  },
  {
    id: "d3",
    business_id: "demo",
    slogan: "Kahvaltı böreği %40 indirimli — sabahın fırsatı",
    title: "Kahvaltı Böreği",
    description: "",
    image_url:
      "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80",
    old_price: 120,
    new_price: 72,
    currency: "TRY",
    starts_at: new Date(now - 8 * 60 * 60_000).toISOString(),
    ends_at: new Date(now - 60 * 60_000).toISOString(),
    total_stock: 30,
    remaining_stock: 0,
    per_user_limit: 1,
    is_surprise_package: false,
    surprise_hint: null,
    status: "EXPIRED" as CampaignStatus,
    created_at: "",
    updated_at: "",
  },
];

/* ── Greeting ── */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi günler";
  return "İyi akşamlar";
}

/* ── Countdown ── */
function useCountdown(endsAt: string) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, new Date(endsAt).getTime() - Date.now())
  );

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining(Math.max(0, new Date(endsAt).getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt, remaining]);

  if (remaining <= 0) return "Süre doldu";
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);
  if (h > 0) return `${h}sa ${m}dk`;
  if (m > 0) return `${m}dk ${s}sn`;
  return `${s}sn`;
}

function CountdownBadge({ endsAt }: { endsAt: string }) {
  const text = useCountdown(endsAt);
  const diff = new Date(endsAt).getTime() - Date.now();
  const isUrgent = diff > 0 && diff <= 30 * 60_000;

  return (
    <View
      style={[
        s.pill,
        {
          backgroundColor: isUrgent
            ? "rgba(255,77,77,0.25)"
            : "rgba(255,255,255,0.15)",
        },
      ]}
    >
      <Clock
        size={11}
        color={isUrgent ? "#FF6B6B" : "rgba(255,255,255,0.9)"}
      />
      <Text
        style={[
          s.pillText,
          { color: isUrgent ? "#FF6B6B" : "rgba(255,255,255,0.9)" },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN SCREEN
   ════════════════════════════════════════════════════════════ */
export default function DashboardScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [endedIds, setEndedIds] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      const [biz, camps] = await Promise.all([
        getMyBusiness(),
        listMyCampaigns(),
      ]);
      if (biz) {
        setBusiness(biz as Business);
        setCampaigns((camps ?? []) as Campaign[]);
        setIsDemo(false);
      } else {
        setBusiness(DEMO_BUSINESS);
        setCampaigns(DEMO_CAMPAIGNS);
        setIsDemo(true);
      }
    } catch {
      setBusiness(DEMO_BUSINESS);
      setCampaigns(DEMO_CAMPAIGNS);
      setIsDemo(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (profile?.role !== "BUSINESS" && !isDemo && !loading) {
    return (
      <View style={s.guardContainer}>
        <Text variant="heading" style={{ marginBottom: 8, textAlign: "center" }}>
          Erişim Engellendi
        </Text>
        <Text variant="caption" style={{ textAlign: "center", marginBottom: 24 }}>
          Bu sayfa sadece işletme hesaplarına açıktır.
        </Text>
        <Link href="/(auth)/business-login" asChild>
          <TouchableOpacity style={s.guardLink}>
            <Text style={s.guardLinkText}>İşletme Girişi</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (!business) return null;

  const meta =
    categoryMeta[business.category as keyof typeof categoryMeta] ?? null;
  const ownerName = profile?.name?.split(" ")[0] ?? (isDemo ? "Hakan" : "");

  const activeCampaigns = campaigns.filter(
    (c) => c.status === "ACTIVE" && !endedIds.has(c.id)
  );
  const pastCampaigns = campaigns.filter(
    (c) => c.status !== "ACTIVE" || endedIds.has(c.id)
  );

  const todayConversions = isDemo ? 12 : Math.floor(Math.random() * 20 + 5);
  const weeklyViews = isDemo ? 156 : Math.floor(Math.random() * 200 + 30);

  function handleEarlyEnd(id: string) {
    Alert.alert(
      "Kampanyayı Bitir",
      "Bu kampanyayı erken bitirmek istediğinize emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Bitir",
          style: "destructive",
          onPress: () => setEndedIds((prev) => new Set(prev).add(id)),
        },
      ]
    );
  }

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.accent}
        />
      }
    >
      {/* Demo banner */}
      {isDemo && (
        <View style={s.demoBanner}>
          <Text style={s.demoBannerText}>
            Demo modu — örnek verilerle çalışıyorsunuz.
          </Text>
        </View>
      )}

      {/* ═══════════ HERO ═══════════ */}
      <View style={s.heroWrap}>
        <Image
          source={{ uri: IMG.hero }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={400}
        />
        <View style={s.heroOverlay} />
        <View style={s.heroContent}>
          <Text style={s.heroGreeting}>
            {getGreeting()},{" "}
            <Text style={s.heroGreetingName}>{ownerName}</Text>
          </Text>
          <Text style={s.heroBusinessName}>{business.name}</Text>
          <View style={s.heroMeta}>
            {meta && (
              <View style={s.heroPill}>
                <Text style={s.heroPillText}>{meta.label}</Text>
              </View>
            )}
            <View style={s.heroPill}>
              <MapPin size={11} color="rgba(255,255,255,0.8)" />
              <Text style={s.heroPillText}>{business.district}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ═══════════ STATS ═══════════ */}
      <View style={s.statsRow}>
        <StatCard
          image={IMG.statActive}
          value={String(activeCampaigns.length)}
          label="Aktif"
          icon={<TrendingUp size={14} color="rgba(255,255,255,0.9)" />}
        />
        <StatCard
          image={IMG.statPeople}
          value={String(todayConversions)}
          label="Bugün"
          suffix=" kişi"
          icon={<Users size={14} color="rgba(255,255,255,0.9)" />}
        />
        <StatCard
          image={IMG.statViews}
          value={String(weeklyViews)}
          label="Görüntüleme"
          icon={<Eye size={14} color="rgba(255,255,255,0.9)" />}
        />
      </View>

      {/* ═══════════ CTA ═══════════ */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push("/(business)/new-campaign")}
        style={s.ctaWrap}
      >
        <Image
          source={{ uri: IMG.cta }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={400}
        />
        <View style={s.ctaOverlay} />
        <View style={s.ctaContent}>
          <View style={s.ctaPlusCircle}>
            <Plus size={24} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.ctaTitle}>Yeni Fırsat Yarat</Text>
            <Text style={s.ctaSub}>Saniyeler içinde yayına al</Text>
          </View>
          <ChevronRight size={20} color="rgba(255,255,255,0.6)" />
        </View>
      </TouchableOpacity>

      {/* ═══════════ ACTIVE CAMPAIGNS ═══════════ */}
      {activeCampaigns.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Aktif Kampanyalar</Text>
          {activeCampaigns.map((c, i) => (
            <ActiveCard
              key={c.id}
              campaign={c}
              imageUrl={getCampaignImage(c, i)}
              onEarlyEnd={() => handleEarlyEnd(c.id)}
            />
          ))}
        </View>
      )}

      {/* ═══════════ PAST CAMPAIGNS ═══════════ */}
      {pastCampaigns.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Geçmiş</Text>
          {pastCampaigns.map((c, i) => (
            <PastCard
              key={c.id}
              campaign={c}
              imageUrl={getCampaignImage(c, activeCampaigns.length + i)}
            />
          ))}
        </View>
      )}

      {/* ═══════════ EMPTY ═══════════ */}
      {campaigns.length === 0 && (
        <View style={s.emptyWrap}>
          <Image
            source={{ uri: IMG.empty }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            transition={400}
          />
          <View style={s.emptyOverlay} />
          <View style={s.emptyContent}>
            <Text style={s.emptyTitle}>Henüz kampanya yok</Text>
            <Text style={s.emptySub}>
              İlk fırsatını oluştur, müşterin gelsin.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

/* ════════════════════════════════════════════════════════════
   STAT CARD
   ════════════════════════════════════════════════════════════ */
function StatCard({
  image,
  value,
  label,
  suffix,
  icon,
}: {
  image: string;
  value: string;
  label: string;
  suffix?: string;
  icon: React.ReactNode;
}) {
  return (
    <View style={s.statCard}>
      <Image
        source={{ uri: image }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={300}
      />
      <View style={s.statOverlay} />
      <View style={s.statContent}>
        {icon}
        <Text style={s.statValue}>
          {value}
          {suffix && <Text style={s.statSuffix}>{suffix}</Text>}
        </Text>
        <Text style={s.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

/* ════════════════════════════════════════════════════════════
   ACTIVE CAMPAIGN CARD
   ════════════════════════════════════════════════════════════ */
function ActiveCard({
  campaign: c,
  imageUrl,
  onEarlyEnd,
}: {
  campaign: Campaign;
  imageUrl: string;
  onEarlyEnd: () => void;
}) {
  const discount = Math.round(
    ((c.old_price - c.new_price) / c.old_price) * 100
  );
  const stockPercent =
    c.total_stock && c.remaining_stock != null
      ? (c.remaining_stock / c.total_stock) * 100
      : null;
  const stockLow = stockPercent !== null && stockPercent <= 25;
  const views = Math.floor(Math.random() * 60 + 10);

  return (
    <View style={s.activeCard}>
      {/* Background image */}
      <Image
        source={{ uri: imageUrl }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={300}
      />
      <View style={s.activeOverlay} />

      {/* Content */}
      <View style={s.activeContent}>
        {/* Badges */}
        <View style={s.badgeRow}>
          <View style={[s.pill, { backgroundColor: "rgba(34,197,94,0.3)" }]}>
            <Text style={[s.pillText, { color: "#4ADE80" }]}>Aktif</Text>
          </View>
          {c.is_surprise_package && (
            <View
              style={[s.pill, { backgroundColor: "rgba(168,85,247,0.3)" }]}
            >
              <Gift size={11} color="#C084FC" />
              <Text style={[s.pillText, { color: "#C084FC" }]}>Sürpriz</Text>
            </View>
          )}
          <CountdownBadge endsAt={c.ends_at} />
        </View>

        {/* Slogan */}
        <Text style={s.activeSlogan} numberOfLines={2}>
          {c.slogan}
        </Text>

        {/* Price row */}
        <View style={s.activePriceRow}>
          <Text style={s.activeOldPrice}>{formatPrice(c.old_price)}</Text>
          <Text style={s.activeNewPrice}>{formatPrice(c.new_price)}</Text>
          <View style={s.activeDiscountPill}>
            <Text style={s.activeDiscountText}>%{discount}</Text>
          </View>
        </View>

        {/* Stock bar */}
        {stockPercent !== null && (
          <View style={s.stockWrap}>
            <Text style={s.stockLabel}>
              {stockLow
                ? `Son ${c.remaining_stock} paket!`
                : `${c.remaining_stock}/${c.total_stock} stok`}
            </Text>
            <View style={s.stockBar}>
              <View
                style={[
                  s.stockFill,
                  {
                    width: `${Math.max(stockPercent, 3)}%`,
                    backgroundColor: stockLow ? "#FF6B6B" : "#4ADE80",
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Bottom row */}
        <View style={s.activeBottom}>
          <View style={s.viewsWrap}>
            <Eye size={12} color="rgba(255,255,255,0.6)" />
            <Text style={s.viewsText}>{views} görüntüleme</Text>
          </View>
          <TouchableOpacity
            onPress={onEarlyEnd}
            style={s.earlyEndBtn}
            activeOpacity={0.7}
          >
            <OctagonX size={12} color="#FF6B6B" />
            <Text style={s.earlyEndText}>Erken Bitir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ════════════════════════════════════════════════════════════
   PAST CAMPAIGN CARD
   ════════════════════════════════════════════════════════════ */
function PastCard({
  campaign: c,
  imageUrl,
}: {
  campaign: Campaign;
  imageUrl: string;
}) {
  const conversions = Math.floor(Math.random() * 40 + 5);

  return (
    <View style={s.pastCard}>
      {/* Thumbnail */}
      <Image
        source={{ uri: imageUrl }}
        style={s.pastThumb}
        contentFit="cover"
        transition={200}
      />
      <View style={s.pastThumbOverlay} />

      {/* Content */}
      <View style={s.pastBody}>
        <Text style={s.pastSlogan} numberOfLines={1}>
          {c.slogan}
        </Text>
        <View style={s.pastMeta}>
          <Text style={s.pastPrice}>
            {formatPrice(c.old_price)} → {formatPrice(c.new_price)}
          </Text>
          <View style={s.pastConvWrap}>
            <Users size={11} color={Colors.textMute} />
            <Text style={s.pastConvText}>{conversions}</Text>
          </View>
        </View>
      </View>

      {/* Repeat */}
      <TouchableOpacity style={s.repeatBtn} activeOpacity={0.7}>
        <RotateCcw size={13} color={Colors.textMute} />
      </TouchableOpacity>
    </View>
  );
}

/* ════════════════════════════════════════════════════════════
   STYLES
   ════════════════════════════════════════════════════════════ */
const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { paddingBottom: 100 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bg,
  },

  /* Demo banner */
  demoBanner: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    backgroundColor: "rgba(245,158,11,0.1)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.25)",
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  demoBannerText: { fontSize: FontSize.xs, color: Colors.amber, textAlign: "center" },

  /* ── HERO ── */
  heroWrap: {
    height: 200,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  heroContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: Spacing.lg,
  },
  heroGreeting: {
    fontSize: FontSize.sm,
    color: "rgba(255,255,255,0.7)",
  },
  heroGreetingName: {
    fontWeight: "700",
    color: "#fff",
  },
  heroBusinessName: {
    fontSize: FontSize.xxxl,
    fontWeight: "900",
    color: "#fff",
    marginTop: 2,
    letterSpacing: -0.5,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: Spacing.xs,
  },
  heroPillText: {
    fontSize: FontSize.xs,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
    marginLeft: 3,
  },

  /* ── STATS ── */
  statsRow: {
    flexDirection: "row",
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  statCard: {
    flex: 1,
    height: 100,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginRight: Spacing.sm,
  },
  statOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  statContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: Spacing.sm,
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: "900",
    color: "#fff",
    marginTop: 4,
  },
  statSuffix: {
    fontSize: FontSize.xs,
    fontWeight: "500",
    color: "rgba(255,255,255,0.6)",
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 1,
  },

  /* ── CTA ── */
  ctaWrap: {
    height: 80,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  ctaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  ctaContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  ctaPlusCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  ctaTitle: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: "#fff",
  },
  ctaSub: {
    fontSize: FontSize.xs,
    color: "rgba(255,255,255,0.6)",
    marginTop: 1,
  },

  /* ── SECTIONS ── */
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  /* ── PILLS / BADGES ── */
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 4,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 3,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.sm,
  },

  /* ── ACTIVE CAMPAIGN CARD ── */
  activeCard: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    marginBottom: Spacing.md,
    minHeight: 240,
  },
  activeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.58)",
  },
  activeContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: Spacing.md,
  },
  activeSlogan: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  activePriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  activeOldPrice: {
    fontSize: FontSize.sm,
    color: "rgba(255,255,255,0.5)",
    textDecorationLine: "line-through",
    marginRight: Spacing.sm,
  },
  activeNewPrice: {
    fontSize: FontSize.xl,
    fontWeight: "900",
    color: "#fff",
    marginRight: Spacing.sm,
  },
  activeDiscountPill: {
    backgroundColor: "rgba(255,77,77,0.3)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  activeDiscountText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FF6B6B",
  },

  /* Stock */
  stockWrap: { marginBottom: Spacing.sm },
  stockLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 3,
    fontWeight: "600",
  },
  stockBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    overflow: "hidden",
  },
  stockFill: { height: "100%", borderRadius: 2 },

  /* Active bottom */
  activeBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewsWrap: { flexDirection: "row", alignItems: "center" },
  viewsText: {
    fontSize: FontSize.xs,
    color: "rgba(255,255,255,0.5)",
    marginLeft: 4,
  },
  earlyEndBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.35)",
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  earlyEndText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: "#FF6B6B",
    marginLeft: 4,
  },

  /* ── PAST CAMPAIGN CARD ── */
  pastCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.sm,
    height: 72,
  },
  pastThumb: {
    width: 72,
    height: 72,
  },
  pastThumbOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 72,
    height: 72,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  pastBody: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    justifyContent: "center",
  },
  pastSlogan: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: "600",
  },
  pastMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  pastPrice: {
    fontSize: FontSize.xs,
    color: Colors.textMute,
    marginRight: Spacing.md,
  },
  pastConvWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  pastConvText: {
    fontSize: FontSize.xs,
    color: Colors.textMute,
    marginLeft: 3,
  },
  repeatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  repeatText: {
    fontSize: FontSize.xs,
    color: Colors.textSoft,
    marginLeft: 3,
  },

  /* ── EMPTY ── */
  emptyWrap: {
    height: 200,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  emptyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: "800",
    color: "#fff",
  },
  emptySub: {
    fontSize: FontSize.sm,
    color: "rgba(255,255,255,0.6)",
    marginTop: Spacing.xs,
    textAlign: "center",
  },

  /* ── GUARD ── */
  guardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bg,
    padding: Spacing.xl,
  },
  guardLink: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent,
  },
  guardLinkText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: FontSize.base,
  },
});
