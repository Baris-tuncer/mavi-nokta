import { ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "./ui/Text";
import { categoryMeta, MockCategory } from "../lib/mock-campaigns";
import { Colors, Spacing, BorderRadius, FontSize } from "../lib/constants";

type CategoryOption = "ALL" | MockCategory;

type Props = {
  activeCategory: string;
  onSelect: (category: CategoryOption) => void;
};

const categories: { key: CategoryOption; label: string; emoji: string }[] = [
  { key: "ALL", label: "Tümü", emoji: "\uD83D\uDD25" },
  ...Object.entries(categoryMeta).map(([key, meta]) => ({
    key: key as MockCategory,
    label: meta.label,
    emoji: meta.emoji,
  })),
];

export function CategoryPills({ activeCategory, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.key;
        return (
          <TouchableOpacity
            key={cat.key}
            style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
            onPress={() => onSelect(cat.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.pillText,
                isActive ? styles.pillTextActive : styles.pillTextInactive,
              ]}
            >
              {cat.emoji} {cat.label}
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
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs,
  },
  pillActive: {
    backgroundColor: Colors.accent,
  },
  pillInactive: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  pillTextActive: {
    color: Colors.white,
  },
  pillTextInactive: {
    color: Colors.textSoft,
  },
});
