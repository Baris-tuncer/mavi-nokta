import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Text } from "./Text";
import { Colors, BorderRadius, Spacing, FontSize } from "../../lib/constants";

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
          color={variant === "primary" ? Colors.white : Colors.blue}
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
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    minHeight: 48,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: FontSize.base,
    fontWeight: "600",
  },
});

const variantStyles: Record<Variant, any> = {
  primary: {
    backgroundColor: Colors.text,
  },
  secondary: {
    backgroundColor: Colors.blue,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: Colors.magenta,
  },
};

const textVariantStyles: Record<Variant, any> = {
  primary: { color: Colors.white },
  secondary: { color: Colors.white },
  outline: { color: Colors.text },
  ghost: { color: Colors.blue },
  danger: { color: Colors.white },
};
