import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "./ui/Text";
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from "../lib/constants";

type Props = {
  businessName: string;
  stampCount: number;
  stampTarget: number;
  rewardText: string;
  isRewardClaimed?: boolean;
};

export function LoyaltyCard({
  businessName,
  stampCount,
  stampTarget,
  rewardText,
  isRewardClaimed,
}: Props) {
  const stamps = Array.from({ length: stampTarget }, (_, i) => i < stampCount);
  const rewardReady = stampCount >= stampTarget && !isRewardClaimed;

  // Layout: rows of 5
  const rows: boolean[][] = [];
  for (let i = 0; i < stamps.length; i += 5) {
    rows.push(stamps.slice(i, i + 5));
  }

  return (
    <View style={[styles.card, rewardReady && styles.cardReward]}>
      <Text style={styles.bizName}>{businessName}</Text>

      <View style={styles.grid}>
        {rows.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((filled, colIdx) => (
              <View
                key={colIdx}
                style={[
                  styles.stamp,
                  filled ? styles.stampFilled : styles.stampEmpty,
                ]}
              >
                {filled && <Text style={styles.stampCheck}>✓</Text>}
              </View>
            ))}
          </View>
        ))}
      </View>

      <Text style={styles.progressText}>
        {stampCount}/{stampTarget} damga
      </Text>

      {rewardReady ? (
        <View style={styles.rewardBanner}>
          <Text style={styles.rewardBannerText}>
            Odulenizi kazandiniz!
          </Text>
          <Text style={styles.rewardDesc}>{rewardText}</Text>
        </View>
      ) : (
        <Text style={styles.rewardInfo}>{rewardText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  cardReward: {
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  bizName: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  grid: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  stamp: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  stampFilled: {
    backgroundColor: Colors.accent,
  },
  stampEmpty: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  stampCheck: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  progressText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textSoft,
    marginBottom: Spacing.xs,
  },
  rewardInfo: {
    fontSize: FontSize.sm,
    color: Colors.textMute,
  },
  rewardBanner: {
    backgroundColor: Colors.accentSoft,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  rewardBannerText: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.accent,
    marginBottom: 2,
  },
  rewardDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSoft,
  },
});
