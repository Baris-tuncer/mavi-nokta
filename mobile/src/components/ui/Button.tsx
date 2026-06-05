import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Text } from "./Text";
import { Colors, BorderRadius, Spacing, FontSize, Shadow } from "../../lib/constants";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

type Props = TouchableOpacityProps & {
  title: string;
  variant?: Variant;
  loading?: boolean;
  icon?: React.ReactNode;
};

export function Button({
  title,
  variant = "primary",
  loading = false,
  disabled,
  icon,
  style,
  ...props
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" || variant === "ghost" ? Colors.accent : Colors.white}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              textVariantStyles[variant],
              icon ? { marginLeft: Spacing.sm } : undefined,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    minHeight: 52,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontSize: FontSize.base,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

const variantStyles: Record<Variant, any> = {
  primary: {
    backgroundColor: Colors.accent,
    ...Shadow.glow,
  },
  secondary: {
    backgroundColor: Colors.surface2,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: Colors.action,
  },
};

const textVariantStyles: Record<Variant, any> = {
  primary: { color: Colors.white },
  secondary: { color: Colors.text },
  outline: { color: Colors.text },
  ghost: { color: Colors.accent },
  danger: { color: Colors.white },
};
