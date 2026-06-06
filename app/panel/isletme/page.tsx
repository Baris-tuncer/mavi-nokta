import { getCurrentProfile } from "@/app/_actions/profile";
import { getMyBusiness, listMyCampaigns } from "@/app/_actions/campaign";
import { categoryMeta, type MockCategory } from "@/lib/mock-campaigns";
import { Dashboard } from "@/components/panel/Dashboard";
import {
  demoBusiness,
  demoCampaigns,
  demoStats,
  type DashboardBusiness,
  type DashboardCampaign,
  type DashboardStats,
} from "@/lib/mock-dashboard";
import { demoLoyaltyCard } from "@/lib/mock-loyalty";
import { demoScannerData } from "@/lib/mock-scanner";

export default async function BusinessPanelPage() {
  let business: DashboardBusiness;
  let campaigns: DashboardCampaign[];
  let stats: DashboardStats;
  let isDemo = false;

  try {
    const profile = await getCurrentProfile();

    if (profile && profile.role === "BUSINESS") {
      const biz = await getMyBusiness();

      if (biz) {
        const rawCampaigns = await listMyCampaigns();
        const active = rawCampaigns.filter((c) => c.status === "ACTIVE");

        business = {
          id: biz.id,
          name: biz.name,
          category: biz.category,
          city: biz.city,
          district: biz.district,
          ownerName: profile.name?.split(" ")[0] ?? "Isletme Sahibi",
          isPro: false, // TODO: DB'den cek
        };

        campaigns = rawCampaigns.map((c) => ({
          id: c.id,
          slogan: c.slogan,
          title: c.title,
          oldPrice:
            typeof c.old_price === "string"
              ? parseFloat(c.old_price)
              : (c.old_price as number),
          newPrice:
            typeof c.new_price === "string"
              ? parseFloat(c.new_price)
              : (c.new_price as number),
          startsAt: c.starts_at,
          endsAt: c.ends_at,
          totalStock: c.total_stock,
          remainingStock: c.remaining_stock,
          isSurprisePackage: c.is_surprise_package,
          status: c.status as DashboardCampaign["status"],
          views: Math.floor(Math.random() * 80) + 10,
          conversions: Math.floor(Math.random() * 20) + 1,
          imageUrl: c.image_url,
        }));

        stats = {
          activeCampaigns: active.length,
          todayConversions: campaigns.reduce((s, c) => s + c.conversions, 0),
          weeklyViews: campaigns.reduce((s, c) => s + c.views, 0),
        };

        return (
          <Dashboard
            business={business}
            campaigns={campaigns}
            stats={stats}
            isDemo={false}
            loyaltyCard={demoLoyaltyCard}
            scannerData={demoScannerData}
          />
        );
      }
    }
  } catch {
    // Auth veya DB hatasi → demo moduna dus
  }

  return (
    <Dashboard
      business={demoBusiness}
      campaigns={demoCampaigns}
      stats={demoStats}
      isDemo={true}
      loyaltyCard={demoLoyaltyCard}
      scannerData={demoScannerData}
    />
  );
}
