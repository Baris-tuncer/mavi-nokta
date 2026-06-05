import { View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { Colors, BorderRadius, Spacing, FontSize } from "../../lib/constants";

type Variant = "accent" | "action" | "eco" | "amber" | "neutral";

type Props = {
  label: string;
  variant?: Variant;
  icon?: React.ReactNode;
};

const variantColors: Record<Variant, { bg: string; text: string }> = {
  accent: { bg: Colors.accentSoft, text: Colors.accentLight },
  action: { bg: Colors.actionSoft, text: Colors.action },
  eco: { bg: Colors.ecoSoft, text: Colors.eco },
  amber: { bg: Colors.amberSoft, text: Colors.amber },
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
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
});
