import { Text as RNText, TextProps, StyleSheet } from "react-native";
import { Colors, FontSize } from "../../lib/constants";

type Variant = "body" | "caption" | "label" | "heading" | "title" | "muted";

type Props = TextProps & {
  variant?: Variant;
};

const variantStyles: Record<Variant, any> = {
  body: { fontSize: FontSize.base, color: Colors.text },
  caption: { fontSize: FontSize.sm, color: Colors.textSoft },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textMute,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    fontWeight: "600" as const,
  },
  heading: {
    fontSize: FontSize.xl,
    color: Colors.text,
    fontWeight: "700" as const,
  },
  title: {
    fontSize: FontSize.xxxl,
    color: Colors.text,
    fontWeight: "800" as const,
  },
  muted: { fontSize: FontSize.sm, color: Colors.textMute },
};

export function Text({ variant = "body", style, ...props }: Props) {
  return <RNText style={[variantStyles[variant], style]} {...props} />;
}
