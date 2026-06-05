import { useMemo } from "react";
import type { MockCampaign } from "../lib/mock-campaigns";
import { categoryColors } from "../lib/category-colors";
import { haversineDistance, bearing } from "../lib/geo";
import { Colors } from "../lib/constants";

type Coords = { latitude: number; longitude: number };

export type RadarDot = {
  id: string;
  businessName: string;
  angle: number; // radians, 0 = North clockwise
  fraction: number; // 0 (center) to 1 (edge)
  color: string;
  isUrgent: boolean;
  isSurprise: boolean;
};

const MAX_RANGE = 2000; // meters
const MAX_DOTS = 15;
const KADIKOY_CENTER: Coords = { latitude: 40.9884, longitude: 29.029 };

export function useRadarDots(
  campaigns: MockCampaign[],
  userLocation: Coords | null
): RadarDot[] {
  return useMemo(() => {
    const center = userLocation ?? KADIKOY_CENTER;

    // Group by business slug, keep most urgent campaign per business
    const bizMap = new Map<string, { campaign: MockCampaign; isUrgent: boolean }>();
    for (const c of campaigns) {
      const timeLeft = c.endsAt.getTime() - Date.now();
      if (timeLeft <= 0) continue;
      const isUrgent = timeLeft <= 30 * 60_000;

      const existing = bizMap.get(c.business.slug);
      if (!existing || isUrgent) {
        bizMap.set(c.business.slug, { campaign: c, isUrgent });
      }
    }

    const dots: RadarDot[] = [];
    for (const [, { campaign, isUrgent }] of bizMap) {
      if (dots.length >= MAX_DOTS) break;

      const biz = campaign.business;
      const bizCoords: Coords = {
        latitude: biz.latitude,
        longitude: biz.longitude,
      };

      const dist = haversineDistance(center, bizCoords);
      const angle = bearing(center, bizCoords);
      const fraction = Math.min(dist / MAX_RANGE, 0.85);

      let color = categoryColors[biz.category]?.marker ?? Colors.accent;
      if (isUrgent) color = Colors.neonBlue;
      if (campaign.isSurprisePackage) color = Colors.neonPurple;

      dots.push({
        id: biz.slug,
        businessName: biz.name,
        angle,
        fraction,
        color,
        isUrgent,
        isSurprise: campaign.isSurprisePackage,
      });
    }

    return dots;
  }, [campaigns, userLocation]);
}
