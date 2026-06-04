import type { MockCampaign } from "./mock-campaigns";

export type BusinessGroup = {
  key: string; // business.slug
  name: string;
  district: string;
  category: MockCampaign["business"]["category"];
  lat: number;
  lng: number;
  logoUrl: string;
  campaigns: MockCampaign[];
};

export function groupCampaignsByBusiness(
  campaigns: MockCampaign[]
): BusinessGroup[] {
  const map = new Map<string, BusinessGroup>();
  for (const c of campaigns) {
    const k = c.business.slug;
    const existing = map.get(k);
    if (existing) {
      existing.campaigns.push(c);
    } else {
      map.set(k, {
        key: k,
        name: c.business.name,
        district: c.business.district,
        category: c.business.category,
        lat: c.business.latitude,
        lng: c.business.longitude,
        logoUrl: c.business.logoUrl,
        campaigns: [c],
      });
    }
  }
  return Array.from(map.values());
}

export function cheapestCampaign(group: BusinessGroup) {
  return [...group.campaigns].sort((a, b) => a.newPrice - b.newPrice)[0];
}
