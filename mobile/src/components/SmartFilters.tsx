import React from "react";
import { ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Text } from "./ui/Text";
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from "../lib/constants";

export type SmartFilterKey = "WALKING" | "CLOSING_SOON" | "SURPRISE";

const u = (id: string) =>
  `https://images.unsplash.com/${id}?w=96&h=96&q=80&auto=format&fit=crop`;

const FILTERS: {
  key: SmartFilterKey;
  label: string;
  imageUrl: string;
  neonColor: string;
  neonSoft: string;
  glow: typeof Shadow.neonBlueGlow;
}[] = [
  {
    key: "WALKING",
    label: "Yürüme Mesafesi",
    imageUrl: u("photo-1476480862126-209bfaa8edc8"),
    neonColor: Colors.neonBlue,
    neonSoft: Colors.neonBlueSoft,
    glow: Shadow.neonBlueGlow,
  },
  {
    key: "CLOSING_SOON",
    label: "Kapanmadan Yetiş",
    imageUrl: u("photo-1501139083538-0139583c060f"),
    neonColor: Colors.neonOrange,
    neonSoft: Colors.neonOrangeSoft,
    glow: Shadow.neonOrangeGlow,
  },
  {
    key: "SURPRISE",
    label: "Sürpriz Paketler",
    imageUrl: u("photo-1513885535751-8b9238bd345a"),
    neonColor: Colors.neonPurple,
    neonSoft: Colors.neonPurpleSoft,
    glow: Shadow.neonPurpleGlow,
  },
];

type Props = {
  activeFilters: Set<SmartFilterKey>;
  onToggle: (key: SmartFilterKey) => void;
};

export function SmartFilters({ activeFilters, onToggle }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((f) => {
        const active = activeFilters.has(f.key);
        return (
          <TouchableOpacity
            key={f.key}
            activeOpacity={0.7}
            onPress={() => onToggle(f.key)}
            style={[
              styles.pill,
              active && {
                backgroundColor: f.neonSoft,
                borderColor: f.neonColor,
                ...f.glow,
              },
            ]}
          >
            <Image
              source={f.imageUrl}
              style={[
                styles.thumb,
                active && { borderColor: f.neonColor },
              ]}
              contentFit="cover"
              transition={200}
            />
            <Text
              style={[
                styles.label,
                active && { color: f.neonColor },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 5,
    paddingRight: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  thumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surface2,
    backgroundColor: Colors.surface2,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textSoft,
  },
});
