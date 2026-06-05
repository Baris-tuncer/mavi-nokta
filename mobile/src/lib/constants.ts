export const Colors = {
  // Primary — Mavi Nokta brand blue
  accent: "#1F6BFF",
  accentLight: "#4D8AFF",
  accentDark: "#1456CC",
  accentSoft: "rgba(31, 107, 255, 0.08)",

  // Action
  action: "#FF3B30",
  actionSoft: "rgba(255, 59, 48, 0.08)",

  // Status
  eco: "#34C759",
  ecoSoft: "rgba(52, 199, 89, 0.08)",
  amber: "#FF9500",
  amberSoft: "rgba(255, 149, 0, 0.08)",

  // Surfaces — Apple white
  bg: "#F5F5F7",
  surface: "#FFFFFF",
  surface2: "#F0F0F2",
  surface3: "#E5E5EA",

  // Borders — ultra-subtle
  border: "rgba(0, 0, 0, 0.06)",
  borderStrong: "rgba(0, 0, 0, 0.12)",
  borderAccent: "rgba(31, 107, 255, 0.2)",

  // Text — Apple antrasit
  text: "#1D1D1F",
  textSoft: "#636366",
  textMute: "#8E8E93",
  textInverse: "#FFFFFF",

  // Semantic (refined, no neon)
  neonBlue: "#1F6BFF",
  neonBlueSoft: "rgba(31, 107, 255, 0.08)",
  neonBlueMedium: "rgba(31, 107, 255, 0.2)",
  neonOrange: "#FF9500",
  neonOrangeSoft: "rgba(255, 149, 0, 0.08)",
  neonOrangeMedium: "rgba(255, 149, 0, 0.2)",
  neonPurple: "#AF52DE",
  neonPurpleSoft: "rgba(175, 82, 222, 0.08)",
  neonPurpleMedium: "rgba(175, 82, 222, 0.2)",

  // Radar (light)
  radarBg: "#F0F0F5",
  radarGrid: "rgba(31, 107, 255, 0.08)",
  radarPulse: "rgba(31, 107, 255, 0.15)",

  // Utility
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0, 0, 0, 0.4)",
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
  xxl: 28,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 5,
  },
  glow: {
    shadowColor: "#1F6BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  neonBlueGlow: {
    shadowColor: "#1F6BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  neonOrangeGlow: {
    shadowColor: "#FF9500",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  neonPurpleGlow: {
    shadowColor: "#AF52DE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
} as const;

export const CITY_CENTER: Record<string, [number, number]> = {
  istanbul: [41.0082, 28.9784],
  ankara: [39.9334, 32.8597],
  izmir: [38.4192, 27.1287],
  bursa: [40.1828, 29.0665],
  antalya: [36.8969, 30.7133],
};
