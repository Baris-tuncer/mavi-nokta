import { HomePage } from "@/components/HomePage";
import { mockCampaigns } from "@/lib/mock-campaigns";
import { getActiveCampaignsForHomepage } from "@/lib/queries/campaigns";

export default async function Home() {
  let real: Awaited<ReturnType<typeof getActiveCampaignsForHomepage>> = [];
  try {
    real = await getActiveCampaignsForHomepage();
  } catch (e) {
    console.error("[home query]", e);
  }

  const usingReal = real.length > 0;
  const campaigns = [...real, ...mockCampaigns];

  return <HomePage campaigns={campaigns} usingReal={usingReal} />;
}
