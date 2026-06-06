/* ═══════════════════════════════════════════════════════════════
   MOCK SUBSCRIPTION DATA
   Pro abonelik & plan karsilastirma demo verisi
   ═══════════════════════════════════════════════════════════════ */

export type FeatureComparison = {
  label: string;
  free: boolean | string;
  pro: boolean | string;
};

export type PlanInfo = {
  name: string;
  price: number;
  period: string;
  features: FeatureComparison[];
  trialDays: number;
};

export const demoPlans: { free: PlanInfo; pro: PlanInfo } = {
  free: {
    name: "Free",
    price: 0,
    period: "ay",
    features: [
      { label: "Aktif kampanya", free: "2 adet", pro: "Sinirsiz" },
      { label: "Temel istatistikler", free: true, pro: true },
      { label: "Detayli analitik", free: false, pro: true },
      { label: "Oncelikli listeleme", free: false, pro: true },
      { label: "Sadakat programi", free: false, pro: true },
      { label: "Ozel destek", free: false, pro: true },
    ],
    trialDays: 0,
  },
  pro: {
    name: "Pro",
    price: 149,
    period: "ay",
    features: [
      { label: "Aktif kampanya", free: "2 adet", pro: "Sinirsiz" },
      { label: "Temel istatistikler", free: true, pro: true },
      { label: "Detayli analitik", free: false, pro: true },
      { label: "Oncelikli listeleme", free: false, pro: true },
      { label: "Sadakat programi", free: false, pro: true },
      { label: "Ozel destek", free: false, pro: true },
    ],
    trialDays: 7,
  },
};
