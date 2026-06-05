import { View, ViewProps, StyleSheet } from "react-native";
import { Colors, BorderRadius, Spacing, Shadow } from "../../lib/constants";

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
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.md,
  },
  padded: {
    padding: Spacing.md,
  },
});
