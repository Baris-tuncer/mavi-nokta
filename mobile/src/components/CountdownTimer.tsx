import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, BorderRadius, FontSize, Spacing } from "../lib/constants";

type Props = {
  endsAt: string; // ISO date string
  variant?: "card" | "large";
};

function diff(endsAt: number) {
  const ms = Math.max(0, endsAt - Date.now());
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { ms, h, m, s, totalSec };
}

export function CountdownTimer({ endsAt, variant = "card" }: Props) {
  const target = new Date(endsAt).getTime();
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const expired = t.ms === 0;
  const urgent = !expired && t.totalSec <= 30 * 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (variant === "large") {
    return (
      <View style={styles.largeContainer}>
        <TimeBlock value={t.h} label="sa" highlight={urgent} />
        <Sep />
        <TimeBlock value={t.m} label="dk" highlight={urgent} />
        <Sep />
        <TimeBlock value={t.s} label="sn" highlight={urgent} />
      </View>
    );
  }

  // Card variant
  const badgeStyle = expired
    ? styles.badgeExpired
    : urgent
    ? styles.badgeUrgent
    : styles.badgeNormal;

  const badgeTextStyle = expired
    ? styles.badgeTextExpired
    : urgent
    ? styles.badgeTextUrgent
    : styles.badgeTextNormal;

  return (
    <View style={[styles.badge, badgeStyle]}>
      {expired ? (
        <Text style={[styles.badgeText, badgeTextStyle]}>Suresi doldu</Text>
      ) : t.h > 0 ? (
        <Text style={[styles.badgeText, badgeTextStyle]}>
          {t.h}sa {pad(t.m)}dk {pad(t.s)}sn
        </Text>
      ) : (
        <Text style={[styles.badgeText, badgeTextStyle]}>
          {pad(t.m)}:{pad(t.s)}
        </Text>
      )}
    </View>
  );
}

function TimeBlock({
  value,
  label,
  highlight,
}: {
  value: number;
  label: string;
  highlight: boolean;
}) {
  return (
    <View
      style={[
        styles.timeBlock,
        highlight ? styles.timeBlockHighlight : styles.timeBlockDefault,
      ]}
    >
      <Text
        style={[
          styles.timeBlockValue,
          { color: highlight ? Colors.magenta : Colors.text },
        ]}
      >
        {value.toString().padStart(2, "0")}
      </Text>
      <Text style={styles.timeBlockLabel}>{label}</Text>
    </View>
  );
}

function Sep() {
  return <Text style={styles.sep}>:</Text>;
}

const styles = StyleSheet.create({
  // Large variant
  largeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  timeBlock: {
    minWidth: 48,
    alignItems: "center",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  timeBlockDefault: {
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  timeBlockHighlight: {
    borderColor: `${Colors.magenta}4D`, // ~30% opacity
    backgroundColor: `${Colors.magenta}1A`, // ~10% opacity
  },
  timeBlockValue: {
    fontSize: FontSize.xxl,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
    lineHeight: FontSize.xxl,
  },
  timeBlockLabel: {
    marginTop: 2,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: Colors.textMute,
  },
  sep: {
    fontSize: FontSize.lg,
    fontWeight: "900",
    color: Colors.textMute,
  },

  // Card variant badge
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeNormal: {
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  badgeUrgent: {
    backgroundColor: Colors.magenta,
  },
  badgeExpired: {
    backgroundColor: Colors.surface2,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  badgeTextNormal: {
    color: Colors.text,
  },
  badgeTextUrgent: {
    color: Colors.white,
  },
  badgeTextExpired: {
    color: Colors.textMute,
  },
});
