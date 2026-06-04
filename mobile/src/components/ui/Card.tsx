import { View, ViewProps, StyleSheet } from "react-native";
import { Colors, BorderRadius, Spacing } from "../../lib/constants";

type Props = ViewProps & {
  padded?: boolean;
};

export function Card({ padded = true, style, children, ...props }: Props) {
  return (
    <View style={[styles.card, padded && styles.padded, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  padded: {
    padding: Spacing.md,
  },
});
