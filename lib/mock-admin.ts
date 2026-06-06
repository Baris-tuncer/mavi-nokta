/* ═══════════════════════════════════════════════════════════════
   MOCK ADMIN DATA
   Super Admin panel demo verisi
   ═══════════════════════════════════════════════════════════════ */

export type AdminBusiness = {
  id: string;
  name: string;
  category: string;
  city: string;
  district: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  campaignCount: number;
  lastActive: string;
  imageUrl: string;
};

export type AdminStats = {
  totalBusinesses: number;
  activeCampaigns: number;
  totalUsers: number;
  todayRevenue: number;
};

export type AdminAction = {
  id: string;
  type: "APPROVE" | "REJECT" | "SUSPEND" | "CAMPAIGN_ADDED" | "USER_JOINED";
  businessName: string;
  description: string;
  timestamp: string;
};

const now = Date.now();
const mins = (n: number) => new Date(now - n * 60_000).toISOString();

export const demoAdminBusinesses: AdminBusiness[] = [
  {
    id: "ab-1",
    name: "Caferaga Pastanesi",
    category: "BAKERY",
    city: "Istanbul",
    district: "Kadikoy",
    status: "ACTIVE",
    campaignCount: 3,
    lastActive: mins(2),
    imageUrl:
      "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=400&q=80&auto=format&fit=crop",
  },
  {
    id: "ab-2",
    name: "Pub 76",
    category: "PUB",
    city: "Istanbul",
    district: "Besiktas",
    status: "ACTIVE",
    campaignCount: 1,
    lastActive: mins(45),
    imageUrl:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&q=80&auto=format&fit=crop",
  },
  {
    id: "ab-3",
    name: "Veteriner Patiler",
    category: "VET",
    city: "Istanbul",
    district: "Uskudar",
    status: "PENDING",
    campaignCount: 0,
    lastActive: mins(120),
    imageUrl:
      "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400&q=80&auto=format&fit=crop",
  },
  {
    id: "ab-4",
    name: "Sahil Cafe",
    category: "CAFE",
    city: "Istanbul",
    district: "Sariyer",
    status: "ACTIVE",
    campaignCount: 2,
    lastActive: mins(15),
    imageUrl:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80&auto=format&fit=crop",
  },
  {
    id: "ab-5",
    name: "Eczane Guven",
    category: "PHARMACY",
    city: "Istanbul",
    district: "Fatih",
    status: "SUSPENDED",
    campaignCount: 0,
    lastActive: mins(4320),
    imageUrl:
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=80&auto=format&fit=crop",
  },
];

export const demoAdminStats: AdminStats = {
  totalBusinesses: 24,
  activeCampaigns: 8,
  totalUsers: 156,
  todayRevenue: 2480,
};

export const demoAdminActions: AdminAction[] = [
  {
    id: "aa-1",
    type: "APPROVE",
    businessName: "Caferaga Pastanesi",
    description: "Isletme onaylandi",
    timestamp: mins(2),
  },
  {
    id: "aa-2",
    type: "CAMPAIGN_ADDED",
    businessName: "Pub 76",
    description: "Yeni kampanya eklendi",
    timestamp: mins(45),
  },
  {
    id: "aa-3",
    type: "USER_JOINED",
    businessName: "",
    description: "Yeni kullanici kaydoldu",
    timestamp: mins(60),
  },
  {
    id: "aa-4",
    type: "SUSPEND",
    businessName: "Eczane Guven",
    description: "Isletme askiya alindi",
    timestamp: mins(180),
  },
  {
    id: "aa-5",
    type: "CAMPAIGN_ADDED",
    businessName: "Sahil Cafe",
    description: "Yeni kampanya eklendi",
    timestamp: mins(240),
  },
  {
    id: "aa-6",
    type: "APPROVE",
    businessName: "Sahil Cafe",
    description: "Isletme onaylandi",
    timestamp: mins(360),
  },
  {
    id: "aa-7",
    type: "REJECT",
    businessName: "Veteriner Patiler",
    description: "Basvuru reddedildi",
    timestamp: mins(480),
  },
];
