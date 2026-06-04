import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { type MockCampaign, categoryMeta } from "../lib/mock-campaigns";
import { formatPrice } from "../lib/utils";
import { CountdownTimer } from "./CountdownTimer";
import { Colors, Spacing, FontSize, BorderRadius } from "../lib/constants";

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

        {/* Gradient overlay for readability */}
        <View style={styles.gradientOverlay} />

        {/* Top-left: discount badge */}
        <View style={styles.topLeftBadge}>
          <View
            style={[
              styles.discountBadge,
              discount >= 50
                ? styles.discountBadgeFire
                : styles.discountBadgeNeutral,
            ]}
          >
            <Text
              style={[
                styles.discountText,
                discount >= 50
                  ? styles.discountTextFire
                  : styles.discountTextNeutral,
              ]}
            >
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

        {/* Bottom-left: category chip */}
        <View style={styles.bottomLeftBadge}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
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
            <Text style={styles.priceLabel}>Mavi Nokta fiyati</Text>
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
                  { color: stockLow ? Colors.magenta : Colors.textSoft },
                ]}
              >
                {stockLow
                  ? `Son ${campaign.remainingStock} paket!`
                  : `${campaign.remainingStock} paket kaldi`}
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
                      ? Colors.magenta
                      : Colors.blue,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    overflow: "hidden",
  },

  // Image section
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
    height: "50%",
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  // Overlay badges
  topLeftBadge: {
    position: "absolute",
    left: Spacing.md - 4,
    top: Spacing.md - 4,
  },
  topRightBadge: {
    position: "absolute",
    right: Spacing.md - 4,
    top: Spacing.md - 4,
  },
  bottomLeftBadge: {
    position: "absolute",
    left: Spacing.md - 4,
    bottom: Spacing.md - 4,
  },

  // Discount badge
  discountBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  discountBadgeFire: {
    backgroundColor: Colors.magenta,
  },
  discountBadgeNeutral: {
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  discountText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  discountTextFire: {
    color: Colors.white,
  },
  discountTextNeutral: {
    color: Colors.text,
  },

  // Category chip
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryEmoji: {
    fontSize: 12,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.text,
  },

  // Body
  body: {
    padding: Spacing.md,
    gap: Spacing.md - 4,
  },

  // Business row
  businessRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  businessLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  businessName: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
  },

  // Slogan
  slogan: {
    fontSize: FontSize.base,
    fontWeight: "600",
    lineHeight: FontSize.base * 1.35,
    color: Colors.text,
  },

  // Price block
  priceBlock: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md - 4,
    marginTop: Spacing.xs,
  },
  priceLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: Colors.textMute,
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
    color: Colors.blue,
    lineHeight: FontSize.xxl,
  },

  // Stock section
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
    fontWeight: "500",
  },
  stockTotal: {
    fontSize: FontSize.xs,
    color: Colors.textMute,
  },
  stockBarBackground: {
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface2,
    overflow: "hidden",
  },
  stockBarFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
});
