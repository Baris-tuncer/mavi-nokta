import { View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { Colors, BorderRadius, Spacing, FontSize } from "../../lib/constants";

type Variant = "blue" | "magenta" | "eco" | "amber" | "neutral";

type Props = {
  label: string;
  variant?: Variant;
  icon?: React.ReactNode;
};

const variantColors: Record<Variant, { bg: string; text: string }> = {
  blue: { bg: Colors.blueSoft, text: Colors.blue },
  magenta: { bg: "#FCE8EF", text: Colors.magenta },
  eco: { bg: "#E8F8EE", text: Colors.eco },
  amber: { bg: "#FFF4E0", text: Colors.amber },
  neutral: { bg: Colors.surface2, text: Colors.textSoft },
};

export function Badge({ label, variant = "neutral", icon }: Props) {
  const colors = variantColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      {icon}
      <Text
        style={[
          styles.text,
          { color: colors.text },
          icon ? { marginLeft: 4 } : undefined,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
});
