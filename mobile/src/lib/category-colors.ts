import { Colors } from "./constants";
import type { MockCategory } from "./mock-campaigns";

export const categoryColors: Record<
  MockCategory,
  { marker: string; markerBorder: string; soft: string }
> = {
  CAFE: {
    marker: Colors.accent,
    markerBorder: Colors.accentLight,
    soft: Colors.accentSoft,
  },
  BAKERY: {
    marker: Colors.amber,
    markerBorder: "#FBBF24",
    soft: Colors.amberSoft,
  },
  PASTANE: {
    marker: "#EC4899",
    markerBorder: "#F472B6",
    soft: "rgba(236, 72, 153, 0.15)",
  },
  RESTAURANT: {
    marker: Colors.action,
    markerBorder: "#FF7070",
    soft: Colors.actionSoft,
  },
  FASTFOOD: {
    marker: "#F97316",
    markerBorder: "#FB923C",
    soft: "rgba(249, 115, 22, 0.15)",
  },
  TATLI: {
    marker: "#D946EF",
    markerBorder: "#E879F9",
    soft: "rgba(217, 70, 239, 0.15)",
  },
  BUFE: {
    marker: "#EAB308",
    markerBorder: "#FACC15",
    soft: "rgba(234, 179, 8, 0.15)",
  },
  KASAP: {
    marker: "#DC2626",
    markerBorder: "#EF4444",
    soft: "rgba(220, 38, 38, 0.15)",
  },
  MANAV: {
    marker: "#16A34A",
    markerBorder: "#22C55E",
    soft: "rgba(22, 163, 74, 0.15)",
  },
  MARKET: {
    marker: Colors.eco,
    markerBorder: "#4ADE80",
    soft: Colors.ecoSoft,
  },
  PUB: {
    marker: "#A855F7",
    markerBorder: "#C084FC",
    soft: "rgba(168, 85, 247, 0.15)",
  },
  PETSHOP: {
    marker: "#F472B6",
    markerBorder: "#F9A8D4",
    soft: "rgba(244, 114, 182, 0.15)",
  },
  PHARMACY: {
    marker: "#38BDF8",
    markerBorder: "#7DD3FC",
    soft: "rgba(56, 189, 248, 0.15)",
  },
  BEAUTY: {
    marker: "#E879F9",
    markerBorder: "#F0ABFC",
    soft: "rgba(232, 121, 249, 0.15)",
  },
  FLORIST: {
    marker: "#FB7185",
    markerBorder: "#FDA4AF",
    soft: "rgba(251, 113, 133, 0.15)",
  },
  GYM: {
    marker: "#6366F1",
    markerBorder: "#818CF8",
    soft: "rgba(99, 102, 241, 0.15)",
  },
  VET: {
    marker: "#2DD4BF",
    markerBorder: "#5EEAD4",
    soft: "rgba(45, 212, 191, 0.15)",
  },
  OTHER: {
    marker: Colors.textSoft,
    markerBorder: Colors.textMute,
    soft: "rgba(156, 163, 175, 0.15)",
  },
};
