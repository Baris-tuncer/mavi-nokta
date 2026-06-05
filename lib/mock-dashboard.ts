const now = Date.now();
const minutes = (n: number) => new Date(now + n * 60_000).toISOString();

export type DashboardBusiness = {
  id: string;
  name: string;
  category: string;
  city: string;
  district: string;
  ownerName: string;
};

export type DashboardCampaign = {
  id: string;
  slogan: string;
  title: string;
  oldPrice: number;
  newPrice: number;
  startsAt: string;
  endsAt: string;
  totalStock: number | null;
  remainingStock: number | null;
  isSurprisePackage: boolean;
  status: "ACTIVE" | "DRAFT" | "EXPIRED" | "SOLD_OUT" | "PAUSED";
  views: number;
  conversions: number;
  imageUrl: string | null;
};

export type DashboardStats = {
  activeCampaigns: number;
  todayConversions: number;
  weeklyViews: number;
};

export const demoBusiness: DashboardBusiness = {
  id: "demo-biz-1",
  name: "Caferağa Pastanesi",
  category: "BAKERY",
  city: "İstanbul",
  district: "Kadıköy",
  ownerName: "Hakan",
};

export const demoCampaigns: DashboardCampaign[] = [
  {
    id: "demo-c1",
    slogan: "Taze Çıktı! Balkabaklı Cheesecake yarı fiyatına",
    title: "Balkabaklı Cheesecake",
    oldPrice: 180,
    newPrice: 99,
    startsAt: minutes(-60),
    endsAt: minutes(45),
    totalStock: 20,
    remainingStock: 8,
    isSurprisePackage: false,
    status: "ACTIVE",
    views: 34,
    conversions: 6,
    imageUrl:
      "https://images.unsplash.com/photo-1567171466295-4afa63d45416?w=400&q=80&auto=format&fit=crop",
  },
  {
    id: "demo-c2",
    slogan: "Gün sonu sürpriz pasta paketi — ne çıkarsa bahtına!",
    title: "Sürpriz Pasta Paketi",
    oldPrice: 250,
    newPrice: 89,
    startsAt: minutes(-30),
    endsAt: minutes(90),
    totalStock: 10,
    remainingStock: 3,
    isSurprisePackage: true,
    status: "ACTIVE",
    views: 18,
    conversions: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80&auto=format&fit=crop",
  },
  {
    id: "demo-c3",
    slogan: "Kahvaltı böreği %40 indirimli — sabahın fırsatı",
    title: "Kahvaltı Böreği",
    oldPrice: 120,
    newPrice: 72,
    startsAt: minutes(-480),
    endsAt: minutes(-60),
    totalStock: 30,
    remainingStock: 0,
    isSurprisePackage: false,
    status: "EXPIRED",
    views: 89,
    conversions: 45,
    imageUrl:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80&auto=format&fit=crop",
  },
];

export const demoStats: DashboardStats = {
  activeCampaigns: 2,
  todayConversions: 12,
  weeklyViews: 156,
};
