import { useState } from "react";
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
} from "react-native";
import { Text } from "./Text";
import { Colors, BorderRadius, Spacing, FontSize } from "../../lib/constants";

type Props = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
};

export function Input({
  label,
  hint,
  error,
  icon,
  style,
  ...props
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text variant="label">{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          focused && styles.focused,
          error && styles.errorBorder,
        ]}
      >
        <TextInput
          style={[styles.input, icon && { paddingRight: 40 }, style]}
          placeholderTextColor={Colors.textMute}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {icon && <View style={styles.icon}>{icon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {hint && !error && <Text variant="muted" style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    marginTop: Spacing.xs,
  },
  focused: {
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  errorBorder: {
    borderColor: Colors.action,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.text,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  icon: {
    position: "absolute",
    right: Spacing.md,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.action,
    marginTop: Spacing.xs,
  },
  hint: {
    marginTop: Spacing.xs,
  },
});
