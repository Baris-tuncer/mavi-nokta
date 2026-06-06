/* ═══════════════════════════════════════════════════════════════
   MOCK LOYALTY DATA
   Cafe loyalty stamp card demo verisi
   ═══════════════════════════════════════════════════════════════ */

export type StampEntry = {
  id: string;
  date: string;
  campaignName: string;
};

export type LoyaltyCardData = {
  id: string;
  businessName: string;
  totalStamps: number;
  collectedStamps: number;
  reward: string;
  stamps: StampEntry[];
};

const now = Date.now();
const days = (n: number) => new Date(now - n * 86_400_000).toISOString();

export const demoLoyaltyCard: LoyaltyCardData = {
  id: "loyalty-1",
  businessName: "Caferaga Pastanesi",
  totalStamps: 10,
  collectedStamps: 6,
  reward: "Bedava Turk Kahvesi",
  stamps: [
    { id: "s1", date: days(14), campaignName: "Cheesecake Firsati" },
    { id: "s2", date: days(11), campaignName: "Surpriz Pasta Paketi" },
    { id: "s3", date: days(8), campaignName: "Kahvalti Boregi" },
    { id: "s4", date: days(5), campaignName: "Tiramisu Gunleri" },
    { id: "s5", date: days(3), campaignName: "Surpriz Pasta Paketi" },
    { id: "s6", date: days(1), campaignName: "Cheesecake Firsati" },
  ],
};
