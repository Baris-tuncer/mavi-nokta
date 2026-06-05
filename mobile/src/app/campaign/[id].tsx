import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { ChevronLeft, Info } from "lucide-react-native";
import { Text } from "../../components/ui/Text";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { CountdownTimer } from "../../components/CountdownTimer";
import { mockCampaigns, categoryMeta } from "../../lib/mock-campaigns";
import { formatPrice } from "../../lib/utils";
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
  Shadow,
} from "../../lib/constants";

const SCREEN_WIDTH = Dimensions.get("window").width;
const IMAGE_HEIGHT = 320;

const CONCEPT_TEXT =
  "Bu görsel, Mavi Nokta kalite standartları gereği sunulacak deneyimi yansıtmak amacıyla konsept olarak seçilmiştir.";

export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const campaign = mockCampaigns.find((c) => c.id === id);

  if (!campaign) {
    return (
      <View style={styles.notFound}>
        <Text variant="heading">Kampanya bulunamadı</Text>
        <Button
          title="Geri Dön"
          variant="ghost"
          onPress={() => router.back()}
          style={styles.backBtn}
        />
      </View>
    );
  }

  const { business } = campaign;
  const meta = categoryMeta[business.category];

  const discount = Math.round(
    ((campaign.oldPrice - campaign.newPrice) / campaign.oldPrice) * 100
  );

  const hasStock =
    campaign.totalStock != null && campaign.remainingStock != null;
  const stockProgress = hasStock
    ? campaign.remainingStock! / campaign.totalStock!
    : 0;

  return (
    <View style={styles.container}>
      {/* Dismiss tooltip on scroll/tap anywhere */}
      <ScrollView
        bounces={false}
        onScrollBeginDrag={() => setTooltipVisible(false)}
      >
        {/* Full-bleed Image */}
        <View style={styles.imageContainer}>
          <Image
            source={campaign.imageUrl}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />

          {/* Back Button — white glass */}
          <TouchableOpacity
            style={styles.backOverlay}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>

          {/* Concept image info icon — frosted glass circle */}
          <TouchableOpacity
            style={styles.infoIconWrap}
            onPress={() => setTooltipVisible((v) => !v)}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <View style={styles.infoIcon}>
              <Info size={13} color={Colors.textSoft} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>

          {/* Glassmorphism tooltip */}
          {tooltipVisible && (
            <Pressable
              style={styles.tooltipBackdrop}
              onPress={() => setTooltipVisible(false)}
            >
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>{CONCEPT_TEXT}</Text>
              </View>
              <View style={styles.tooltipArrow} />
            </Pressable>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Business Row */}
          <View style={styles.businessRow}>
            <Image
              source={business.logoUrl}
              style={styles.businessLogo}
              contentFit="cover"
            />
            <View style={styles.businessInfo}>
              <Text style={styles.businessName}>{business.name}</Text>
              <Text variant="muted">
                {meta.emoji} {meta.label} - {business.district}
              </Text>
            </View>
          </View>

          {/* Title & Slogan */}
          <Text variant="title" style={styles.campaignTitle}>
            {campaign.title}
          </Text>
          <Text variant="caption" style={styles.slogan}>
            {campaign.slogan}
          </Text>

          {/* Countdown Timer */}
          <View style={styles.timerSection}>
            <CountdownTimer
              endsAt={campaign.endsAt.toISOString()}
              variant="large"
            />
          </View>

          {/* Price Block */}
          <View style={styles.priceBlock}>
            <Text style={styles.oldPrice}>
              {formatPrice(campaign.oldPrice)}
            </Text>
            <Text style={styles.newPrice}>
              {formatPrice(campaign.newPrice)}
            </Text>
            <Badge label={`%${discount} indirim`} variant="action" />
          </View>

          {/* Stock Progress Bar */}
          {hasStock && (
            <View style={styles.stockSection}>
              <View style={styles.stockHeader}>
                <Text variant="label">Stok</Text>
                <Text variant="muted">
                  {campaign.remainingStock} / {campaign.totalStock} kaldı
                </Text>
              </View>
              <View style={styles.stockBarBg}>
                <View
                  style={[
                    styles.stockBarFill,
                    {
                      width: `${Math.max(stockProgress * 100, 2)}%`,
                      backgroundColor:
                        stockProgress < 0.2 ? Colors.action : Colors.accent,
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Description */}
          {campaign.description ? (
            <View style={styles.descriptionSection}>
              <Text variant="label" style={styles.descLabel}>
                Detay
              </Text>
              <Text style={styles.descText}>{campaign.description}</Text>
            </View>
          ) : null}

          {/* Concept image footnote — elegant, hierarchically subordinate */}
          <View style={styles.conceptFootnoteRow}>
            <Info size={10} color={Colors.textMute} strokeWidth={2} />
            <Text style={styles.conceptFootnoteText}>Konsept görseli</Text>
          </View>

          {/* CTA Button */}
          <Button
            title="Bu fırsatı yakala"
            variant="primary"
            onPress={() => {
              // TODO: Implement claim flow
            }}
            style={styles.ctaButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bg,
    padding: Spacing.xl,
  },
  backBtn: {
    marginTop: Spacing.md,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  backOverlay: {
    position: "absolute",
    top: 56,
    left: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.sm,
  },

  /* ── Concept image info icon ── */
  infoIconWrap: {
    position: "absolute",
    right: Spacing.md,
    bottom: Spacing.md,
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Glassmorphism tooltip ── */
  tooltipBackdrop: {
    position: "absolute",
    right: Spacing.md,
    bottom: Spacing.md + 36,
    alignItems: "flex-end",
  },
  tooltip: {
    maxWidth: SCREEN_WIDTH * 0.72,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Shadow.md,
  },
  tooltipText: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSoft,
    letterSpacing: 0.1,
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "rgba(255,255,255,0.92)",
    alignSelf: "flex-end",
    marginRight: 8,
  },

  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  businessRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  businessLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface2,
  },
  businessInfo: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  businessName: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.text,
  },
  campaignTitle: {
    marginBottom: Spacing.xs,
  },
  slogan: {
    marginBottom: Spacing.lg,
  },
  timerSection: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  priceBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  oldPrice: {
    fontSize: FontSize.lg,
    color: Colors.textMute,
    textDecorationLine: "line-through",
  },
  newPrice: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.accent,
  },
  stockSection: {
    marginBottom: Spacing.lg,
  },
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  stockBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surface2,
    overflow: "hidden",
  },
  stockBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  descriptionSection: {
    marginBottom: Spacing.lg,
  },
  descLabel: {
    marginBottom: Spacing.xs,
  },
  descText: {
    fontSize: FontSize.base,
    color: Colors.textSoft,
    lineHeight: 22,
  },

  /* ── Concept image footnote ── */
  conceptFootnoteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: Spacing.lg,
  },
  conceptFootnoteText: {
    fontSize: 11,
    color: Colors.textMute,
    letterSpacing: 0.15,
  },

  ctaButton: {
    width: "100%",
  },
});
