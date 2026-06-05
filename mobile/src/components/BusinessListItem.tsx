import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "./ui/Text";
import { type BusinessGroup, cheapestCampaign } from "../lib/business-groups";
import { categoryMeta } from "../lib/mock-campaigns";
import { categoryColors } from "../lib/category-colors";
import { formatPrice } from "../lib/utils";
import { Colors, Spacing, FontSize, BorderRadius } from "../lib/constants";

export const ITEM_HEIGHT = 76;

type Props = {
  group: BusinessGroup;
  isSelected: boolean;
  onPress: () => void;
};

export function BusinessListItem({ group, isSelected, onPress }: Props) {
  const meta = categoryMeta[group.category];
  const colors = categoryColors[group.category];
  const cheapest = cheapestCampaign(group);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container,
        isSelected && {
          borderColor: colors.marker,
          backgroundColor: colors.soft,
        },
      ]}
    >
      <View style={[styles.emojiCircle, { backgroundColor: colors.soft }]}>
        <Text style={styles.emoji}>{meta.emoji}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {group.name}
        </Text>
        <Text variant="muted" numberOfLines={1}>
          {group.district}
        </Text>
      </View>

      <View style={styles.right}>
        {cheapest && (
          <Text style={[styles.price, { color: colors.marker }]}>
            {formatPrice(cheapest.newPrice)}
          </Text>
        )}
        <Text variant="muted" style={styles.countText}>
          {group.campaigns.length} kampanya
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 20,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  name: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.text,
  },
  right: {
    alignItems: "flex-end",
    marginLeft: Spacing.sm,
  },
  price: {
    fontSize: FontSize.lg,
    fontWeight: "800",
  },
  countText: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
