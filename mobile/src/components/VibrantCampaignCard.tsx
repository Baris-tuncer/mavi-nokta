import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Text } from "./ui/Text";
import { Badge } from "./ui/Badge";
import { CountdownTimer } from "./CountdownTimer";
import { categoryMeta, type MockCampaign } from "../lib/mock-campaigns";
import { formatPrice } from "../lib/utils";
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
  Shadow,
} from "../lib/constants";

type Props = {
  campaign: MockCampaign;
  onPress?: () => void;
};

export function VibrantCampaignCard({ campaign, onPress }: Props) {
  const { business } = campaign;
  const meta = categoryMeta[business.category];
  const discount = Math.round(
    ((campaign.oldPrice - campaign.newPrice) / campaign.oldPrice) * 100
  );

  const timeLeft = campaign.endsAt.getTime() - Date.now();
  const isUrgent = timeLeft > 0 && timeLeft <= 30 * 60_000;
  const isSurprise = campaign.isSurprisePackage;

  const borderColor = isUrgent
    ? Colors.neonBlueMedium
    : isSurprise
    ? Colors.neonPurpleMedium
    : Colors.border;

  const glowStyle = isUrgent
    ? Shadow.neonBlueGlow
    : isSurprise
    ? Shadow.neonPurpleGlow
    : undefined;

  const hasStock =
    campaign.totalStock != null && campaign.remainingStock != null;
  const stockFraction = hasStock
    ? campaign.remainingStock! / campaign.totalStock!
    : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        { borderColor },
        glowStyle,
      ]}
    >
      {/* Row 1: Business + Countdown */}
      <View style={styles.topRow}>
        <Image
          source={business.logoUrl}
          style={styles.logo}
          contentFit="cover"
        />
        <View style={styles.bizInfo}>
          <Text style={styles.bizName} numberOfLines={1}>
            {business.name}
          </Text>
          <Text variant="muted" style={styles.bizMeta}>
            {meta.emoji} {meta.label} · {business.district}
          </Text>
        </View>
        <CountdownTimer
          endsAt={campaign.endsAt.toISOString()}
          variant="card"
        />
      </View>

      {/* Row 2: Slogan */}
      <Text style={styles.slogan} numberOfLines={2}>
        {campaign.slogan}
      </Text>

      {/* Row 3: Price */}
      <View style={styles.priceRow}>
        <Text style={styles.oldPrice}>{formatPrice(campaign.oldPrice)}</Text>
        <Text style={styles.newPrice}>{formatPrice(campaign.newPrice)}</Text>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>%{discount}</Text>
        </View>
      </View>

      {/* Row 4: Stock bar */}
      {hasStock && (
        <View style={styles.stockBar}>
          <View
            style={[
              styles.stockFill,
              {
                width: `${Math.max(stockFraction * 100, 3)}%`,
                backgroundColor:
                  stockFraction < 0.2 ? Colors.neonOrange : Colors.neonBlue,
              },
            ]}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface2,
  },
  bizInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  bizName: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.text,
  },
  bizMeta: {
    fontSize: FontSize.xs,
  },
  slogan: {
    fontSize: FontSize.sm,
    color: Colors.textSoft,
    lineHeight: 18,
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
    fontSize: FontSize.xl,
    fontWeight: "800",
    color: Colors.neonBlue,
  },
  discountBadge: {
    backgroundColor: Colors.neonOrangeSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  discountText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.neonOrange,
  },
  stockBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surface2,
    overflow: "hidden",
    marginTop: Spacing.sm,
  },
  stockFill: {
    height: "100%",
    borderRadius: 2,
  },
});
