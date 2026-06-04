"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { dbQuery } from "@/lib/db/pool";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Campaign, CampaignStatus } from "@/lib/database.types";

export type CreateCampaignInput = {
  slogan: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  oldPrice: number;
  newPrice: number;
  startsAt: string; // ISO
  endsAt: string; // ISO
  totalStock?: number | null;
  perUserLimit?: number;
  isSurprisePackage?: boolean;
  surpriseHint?: string | null;
  status?: CampaignStatus;
};

async function getMyBusinessId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { rows } = await dbQuery<{ id: string }>(
    `SELECT id FROM public.businesses WHERE profile_id = $1 LIMIT 1`,
    [user.id]
  );
  return rows[0]?.id ?? null;
}

export async function createCampaign(
  input: CreateCampaignInput
): Promise<{ ok: true; id: string } | { error: string }> {
  const businessId = await getMyBusinessId();
  if (!businessId) return { error: "İşletme kaydın yok" };

  // Basit validasyon
  if (!input.slogan || !input.title) return { error: "Slogan ve başlık zorunlu" };
  if (input.oldPrice <= 0 || input.newPrice <= 0)
    return { error: "Fiyatlar pozitif olmalı" };
  if (input.newPrice >= input.oldPrice)
    return { error: "Yeni fiyat eski fiyattan küçük olmalı" };
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()))
    return { error: "Tarihler geçersiz" };
  if (endsAt.getTime() <= startsAt.getTime())
    return { error: "Bitiş başlangıçtan sonra olmalı" };

  try {
    const { rows } = await dbQuery<{ id: string }>(
      `INSERT INTO public.campaigns
         (business_id, slogan, title, description, image_url,
          old_price, new_price, starts_at, ends_at,
          total_stock, remaining_stock, per_user_limit,
          is_surprise_package, surprise_hint, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING id`,
      [
        businessId,
        input.slogan,
        input.title,
        input.description ?? null,
        input.imageUrl ?? null,
        input.oldPrice,
        input.newPrice,
        startsAt.toISOString(),
        endsAt.toISOString(),
        input.totalStock ?? null,
        input.totalStock ?? null, // remaining = total at create
        input.perUserLimit ?? 1,
        input.isSurprisePackage ?? false,
        input.surpriseHint ?? null,
        input.status ?? "ACTIVE",
      ]
    );
    revalidatePath("/panel/isletme");
    revalidatePath("/");
    return { ok: true, id: rows[0].id };
  } catch (e) {
    console.error("[createCampaign]", e);
    return {
      error: e instanceof Error ? e.message : "Kampanya oluşturulamadı",
    };
  }
}

export async function listMyCampaigns(): Promise<Campaign[]> {
  const businessId = await getMyBusinessId();
  if (!businessId) return [];

  const { rows } = await dbQuery<Campaign>(
    `SELECT id, business_id, slogan, title, description, image_url,
            old_price, new_price, currency,
            starts_at, ends_at,
            total_stock, remaining_stock, per_user_limit,
            is_surprise_package, surprise_hint, status,
            created_at, updated_at
     FROM public.campaigns
     WHERE business_id = $1
     ORDER BY created_at DESC`,
    [businessId]
  );
  return rows;
}

export async function getMyBusiness(): Promise<{
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  is_verified: boolean;
  is_active: boolean;
} | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { rows } = await dbQuery(
    `SELECT id, name, slug, category, city, district, address,
            latitude, longitude, is_verified, is_active
     FROM public.businesses WHERE profile_id = $1 LIMIT 1`,
    [user.id]
  );
  return (rows[0] as ReturnType<typeof getMyBusiness> extends Promise<
    infer T
  >
    ? T
    : never) ?? null;
}
