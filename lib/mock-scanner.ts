/* ═══════════════════════════════════════════════════════════════
   MOCK SCANNER DATA
   QR/PIN scanner + gamification demo verisi
   ═══════════════════════════════════════════════════════════════ */

export type ScanRecord = {
  id: string;
  customerName: string;
  timestamp: string;
  campaignName: string;
  status: "SUCCESS" | "FAILED";
};

export type BadgeInfo = {
  id: string;
  label: string;
  icon: string;
};

export type GamificationData = {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  badges: BadgeInfo[];
};

export type ScannerData = {
  todayScans: number;
  recentScans: ScanRecord[];
  gamification: GamificationData;
};

const now = Date.now();
const mins = (n: number) => new Date(now - n * 60_000).toISOString();

export const demoScannerData: ScannerData = {
  todayScans: 8,
  recentScans: [
    {
      id: "sc-1",
      customerName: "Ahmet B.",
      timestamp: mins(28),
      campaignName: "Cheesecake",
      status: "SUCCESS",
    },
    {
      id: "sc-2",
      customerName: "Elif K.",
      timestamp: mins(95),
      campaignName: "Surpriz Paket",
      status: "SUCCESS",
    },
    {
      id: "sc-3",
      customerName: "Mehmet Y.",
      timestamp: mins(140),
      campaignName: "Cheesecake",
      status: "SUCCESS",
    },
    {
      id: "sc-4",
      customerName: "Zeynep A.",
      timestamp: mins(200),
      campaignName: "Kahvalti Boregi",
      status: "FAILED",
    },
    {
      id: "sc-5",
      customerName: "Can D.",
      timestamp: mins(260),
      campaignName: "Surpriz Paket",
      status: "SUCCESS",
    },
  ],
  gamification: {
    level: 2,
    currentXP: 340,
    nextLevelXP: 500,
    badges: [
      { id: "b1", label: "Ilk Tarama", icon: "scan" },
      { id: "b2", label: "10 Musteri", icon: "users" },
    ],
  },
};
