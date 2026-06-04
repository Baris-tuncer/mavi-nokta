import { supabase } from "../lib/supabase";
import type { CampaignStatus } from "../lib/database.types";
import type { MockCampaign } from "../lib/mock-campaigns";

export type CreateCampaignInput = {
  slogan: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  oldPrice: number;
  newPrice: number;
  startsAt: string;
  endsAt: string;
  totalStock?: number | null;
  perUserLimit?: number;
  isSurprisePackage?: boolean;
  surpriseHint?: string | null;
  status?: CampaignStatus;
};

export async function getActiveCampaigns(): Promise<MockCampaign[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select(
      `
      id, slogan, title, description, image_url,
      old_price, new_price, starts_at, ends_at,
      total_stock, remaining_stock, is_surprise_package,
      businesses!inner (
        id, name, slug, category, city, district,
        address, latitude, longitude, logo_url
      )
    `
    )
    .eq("status", "ACTIVE")
    .gt("ends_at", new Date().toISOString())
    .order("ends_at", { ascending: true })
    .limit(60);

  if (error || !data) return [];

  return data.map((row: any) => {
    const b = Array.isArray(row.businesses)
      ? row.businesses[0]
      : row.businesses;
    return {
      id: row.id,
      slug: row.id,
      slogan: row.slogan,
      title: row.title,
      description: row.description || "",
      imageUrl:
        row.image_url ||
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
      oldPrice: Number(row.old_price),
      newPrice: Number(row.new_price),
      startsAt: new Date(row.starts_at),
      endsAt: new Date(row.ends_at),
      totalStock: row.total_stock,
      remainingStock: row.remaining_stock,
      isSurprisePackage: row.is_surprise_package,
      business: {
        name: b.name,
        slug: b.slug,
        category: b.category,
        city: b.city,
        district: b.district,
        address: b.address,
        latitude: Number(b.latitude),
        longitude: Number(b.longitude),
        logoUrl:
          b.logo_url ||
          "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=96&q=80",
      },
    } satisfies MockCampaign;
  });
}

export async function getMyBusinessId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("businesses")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  return data?.id ?? null;
}

export async function listMyCampaigns() {
  const businessId = await getMyBusinessId();
  if (!businessId) return [];

  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function createCampaign(input: CreateCampaignInput) {
  const businessId = await getMyBusinessId();
  if (!businessId) throw new Error("Isletme bulunamadi");

  if (!input.slogan?.trim() || !input.title?.trim()) {
    throw new Error("Slogan ve baslik zorunlu");
  }
  if (input.oldPrice <= 0 || input.newPrice <= 0) {
    throw new Error("Fiyatlar 0'dan buyuk olmali");
  }
  if (input.newPrice >= input.oldPrice) {
    throw new Error("Yeni fiyat eski fiyattan kucuk olmali");
  }

  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
    throw new Error("Gecersiz tarih");
  }
  if (endsAt <= startsAt) {
    throw new Error("Bitis zamani baslangictan sonra olmali");
  }

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      business_id: businessId,
      slogan: input.slogan.trim(),
      title: input.title.trim(),
      description: input.description || null,
      image_url: input.imageUrl || null,
      old_price: input.oldPrice,
      new_price: input.newPrice,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      total_stock: input.totalStock ?? null,
      remaining_stock: input.totalStock ?? null,
      per_user_limit: input.perUserLimit ?? 1,
      is_surprise_package: input.isSurprisePackage ?? false,
      surprise_hint: input.surpriseHint || null,
      status: input.status ?? "ACTIVE",
    })
    .select()
    .single();

  if (error) throw error;
  return { ok: true as const, id: data.id };
}
