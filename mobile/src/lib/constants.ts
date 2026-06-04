export const Colors = {
  blue: "#1F6BFF",
  blueSoft: "#E8F0FF",
  magenta: "#E5266B",
  eco: "#2FA957",
  amber: "#E89C1F",
  bg: "#FAFAF7",
  surface: "#FFFFFF",
  surface2: "#F2F3F0",
  border: "#E5E7E0",
  borderStrong: "#D2D4CC",
  text: "#0F1729",
  textSoft: "#475467",
  textMute: "#6B7280",
  white: "#FFFFFF",
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const CITY_CENTER: Record<string, [number, number]> = {
  istanbul: [41.0082, 28.9784],
  ankara: [39.9334, 32.8597],
  izmir: [38.4192, 27.1287],
  bursa: [40.1828, 29.0665],
  antalya: [36.8969, 30.7133],
};
