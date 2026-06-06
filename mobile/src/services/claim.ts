import { supabase } from "../lib/supabase";

export type ClaimResult =
  | { ok: true; claim: { id: string; code: string; expiresAt: string } }
  | { error: string };

export type MyClaim = {
  id: string;
  code: string;
  status: string;
  reservedAt: string;
  expiresAt: string;
  priceCharged: number;
  campaign: {
    slogan: string;
    title: string;
    imageUrl: string | null;
    oldPrice: number;
    newPrice: number;
    business: {
      name: string;
      category: string;
      district: string;
    };
  };
};

function generateCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export async function claimCampaign(
  campaignId: string
): Promise<ClaimResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Giris yapmaniz gerekiyor" };

  // Kampanya bilgisi cek
  const { data: campaign, error: campErr } = await supabase
    .from("campaigns")
    .select(
      "id, status, remaining_stock, per_user_limit, ends_at, new_price"
    )
    .eq("id", campaignId)
    .single();

  if (campErr || !campaign) return { error: "Kampanya bulunamadi" };
  if (campaign.status !== "ACTIVE") return { error: "Kampanya aktif degil" };
  if (
    campaign.remaining_stock !== null &&
    campaign.remaining_stock <= 0
  ) {
    return { error: "Stok tukendi" };
  }

  // per_user_limit kontrolu
  const { count } = await supabase
    .from("claims")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaignId)
    .eq("customer_id", user.id)
    .in("status", ["RESERVED", "REDEEMED"]);

  if (count !== null && count >= campaign.per_user_limit) {
    return { error: "Bu kampanyadan daha fazla alamazsiniz" };
  }

  const code = generateCode();
  const now = new Date().toISOString();

  const { data: claim, error: claimErr } = await supabase
    .from("claims")
    .insert({
      campaign_id: campaignId,
      customer_id: user.id,
      code,
      qr_payload: JSON.stringify({ campaignId, code, userId: user.id }),
      status: "RESERVED",
      reserved_at: now,
      expires_at: campaign.ends_at,
      price_charged: campaign.new_price,
    })
    .select("id, code, expires_at")
    .single();

  if (claimErr || !claim) {
    return { error: claimErr?.message ?? "Claim olusturulamadi" };
  }

  // Stok azalt
  if (campaign.remaining_stock !== null) {
    await supabase
      .from("campaigns")
      .update({ remaining_stock: campaign.remaining_stock - 1 })
      .eq("id", campaignId);
  }

  return {
    ok: true,
    claim: {
      id: claim.id,
      code: claim.code,
      expiresAt: claim.expires_at,
    },
  };
}

export async function getMyClaims(): Promise<MyClaim[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("claims")
    .select(
      `
      id, code, status, reserved_at, expires_at, price_charged,
      campaigns (
        slogan, title, image_url, old_price, new_price,
        businesses ( name, category, district )
      )
    `
    )
    .eq("customer_id", user.id)
    .order("reserved_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => {
    const c = Array.isArray(row.campaigns)
      ? row.campaigns[0]
      : row.campaigns;
    const b = c
      ? Array.isArray(c.businesses)
        ? c.businesses[0]
        : c.businesses
      : null;

    return {
      id: row.id,
      code: row.code,
      status: row.status,
      reservedAt: row.reserved_at,
      expiresAt: row.expires_at,
      priceCharged: row.price_charged,
      campaign: {
        slogan: c?.slogan ?? "",
        title: c?.title ?? "",
        imageUrl: c?.image_url ?? null,
        oldPrice: Number(c?.old_price ?? 0),
        newPrice: Number(c?.new_price ?? 0),
        business: {
          name: b?.name ?? "",
          category: b?.category ?? "",
          district: b?.district ?? "",
        },
      },
    };
  });
}
