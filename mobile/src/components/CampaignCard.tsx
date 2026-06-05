import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { Info } from "lucide-react-native";
import { type MockCampaign, categoryMeta } from "../lib/mock-campaigns";
import { formatPrice } from "../lib/utils";
import { CountdownTimer } from "./CountdownTimer";
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from "../lib/constants";

type Props = {
  campaign: MockCampaign;
  onPress?: () => void;
};

export function CampaignCard({ campaign, onPress }: Props) {
  const cat = categoryMeta[campaign.business.category];
  const discount = Math.round(
    (1 - campaign.newPrice / campaign.oldPrice) * 100
  );
  const stockLow =
    campaign.remainingStock !== null &&
    campaign.totalStock !== null &&
    campaign.remainingStock / campaign.totalStock <= 0.25;

  const stockPercent =
    campaign.totalStock
      ? (campaign.remainingStock! / campaign.totalStock) * 100
      : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}
    >
      {/* IMAGE HEADER */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: campaign.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />

        {/* Gradient overlay */}
        <View style={styles.gradientOverlay} />

        {/* Top-left: discount badge */}
        <View style={styles.topLeftBadge}>
          <View
            style={[
              styles.discountBadge,
              discount >= 50
                ? styles.discountBadgeFire
                : styles.discountBadgeNormal,
            ]}
          >
            <Text style={styles.discountText}>
              %{discount} indirim
            </Text>
          </View>
        </View>

        {/* Top-right: countdown */}
        <View style={styles.topRightBadge}>
          <CountdownTimer
            endsAt={campaign.endsAt.toISOString()}
            variant="card"
          />
        </View>

        {/* Bottom-left: category chip — white glass */}
        <View style={styles.bottomLeftBadge}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
          </View>
        </View>

        {/* Bottom-right: concept image indicator */}
        <View style={styles.bottomRightBadge}>
          <View style={styles.conceptIcon}>
            <Info size={11} color={Colors.textMute} strokeWidth={2.5} />
          </View>
        </View>
      </View>

      {/* BODY */}
      <View style={styles.body}>
        {/* Business info row */}
        <View style={styles.businessRow}>
          <Image
            source={{ uri: campaign.business.logoUrl }}
            style={styles.businessLogo}
            contentFit="cover"
          />
          <Text style={styles.businessName} numberOfLines={1}>
            {campaign.business.name}
          </Text>
        </View>

        {/* Slogan */}
        <Text style={styles.slogan} numberOfLines={2}>
          {campaign.slogan}
        </Text>

        {/* Price block */}
        <View style={styles.priceBlock}>
          <View>
            <Text style={styles.priceLabel}>Eski fiyat</Text>
            <Text style={styles.oldPrice}>
              {formatPrice(campaign.oldPrice)}
            </Text>
          </View>
          <View style={styles.priceRight}>
            <Text style={styles.priceLabel}>Mavi Nokta fiyatı</Text>
            <Text style={styles.newPrice}>
              {formatPrice(campaign.newPrice)}
            </Text>
          </View>
        </View>

        {/* Stock progress bar */}
        {campaign.remainingStock !== null && (
          <View style={styles.stockSection}>
            <View style={styles.stockInfoRow}>
              <Text
                style={[
                  styles.stockText,
                  { color: stockLow ? Colors.action : Colors.textSoft },
                ]}
              >
                {stockLow
                  ? `Son ${campaign.remainingStock} paket!`
                  : `${campaign.remainingStock} paket kaldı`}
              </Text>
              {campaign.totalStock && (
                <Text style={styles.stockTotal}>
                  / {campaign.totalStock}
                </Text>
              )}
            </View>
            <View style={styles.stockBarBackground}>
              <View
                style={[
                  styles.stockBarFill,
                  {
                    width: `${stockPercent}%`,
                    backgroundColor: stockLow
                      ? Colors.action
                      : Colors.accent,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Concept image footnote */}
        <Text style={styles.conceptFootnote}>Konsept görseli</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.md,
  },

  imageWrapper: {
    position: "relative",
    width: "100%",
    aspectRatio: 5 / 3,
    backgroundColor: Colors.surface2,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "60%",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  topLeftBadge: {
    position: "absolute",
    left: Spacing.sm,
    top: Spacing.sm,
  },
  topRightBadge: {
    position: "absolute",
    right: Spacing.sm,
    top: Spacing.sm,
  },
  bottomLeftBadge: {
    position: "absolute",
    left: Spacing.sm,
    bottom: Spacing.sm,
  },

  discountBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  discountBadgeFire: {
    backgroundColor: Colors.action,
  },
  discountBadgeNormal: {
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  discountText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: 0.3,
  },

  /* White glass category chip */
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryEmoji: {
    fontSize: 12,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.text,
  },

  body: {
    padding: 20,
    gap: 10,
  },

  businessRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  businessLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  businessName: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textSoft,
  },

  slogan: {
    fontSize: FontSize.base,
    fontWeight: "700",
    lineHeight: FontSize.base * 1.4,
    color: Colors.text,
  },

  priceBlock: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    marginTop: Spacing.xs,
  },
  priceLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: Colors.textMute,
    marginBottom: 2,
  },
  oldPrice: {
    fontSize: FontSize.sm,
    color: Colors.textMute,
    textDecorationLine: "line-through",
  },
  priceRight: {
    alignItems: "flex-end",
  },
  newPrice: {
    fontSize: FontSize.xxl,
    fontWeight: "900",
    color: Colors.accent,
    lineHeight: FontSize.xxl * 1.1,
  },

  stockSection: {
    gap: 6,
  },
  stockInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stockText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  stockTotal: {
    fontSize: FontSize.xs,
    color: Colors.textMute,
  },
  stockBarBackground: {
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface2,
    overflow: "hidden",
  },
  stockBarFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },

  /* Concept image indicator */
  bottomRightBadge: {
    position: "absolute",
    right: Spacing.sm,
    bottom: Spacing.sm,
  },
  conceptIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  conceptFootnote: {
    fontSize: 10,
    color: Colors.textMute,
    letterSpacing: 0.2,
    textAlign: "right",
    marginTop: 2,
  },
});
