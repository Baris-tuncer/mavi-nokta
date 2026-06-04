"use server";

import { dbQuery } from "@/lib/db/pool";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import type { BusinessCategory } from "@/lib/database.types";

const CITY_CENTER: Record<string, [number, number]> = {
  istanbul: [41.0082, 28.9784],
  ankara: [39.9334, 32.8597],
  izmir: [38.4192, 27.1287],
  bursa: [40.1828, 29.0665],
  antalya: [36.8969, 30.7133],
};

export type CreateBusinessInput = {
  businessName: string;
  category: BusinessCategory;
  cityKey: string; // 'istanbul', 'ankara' …
  cityLabel: string;
  district: string;
  address: string;
  phone?: string | null;
};

export async function createBusiness(
  input: CreateBusinessInput
): Promise<{ ok: true; slug: string } | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Auth gerekli" };

  const [lat, lng] =
    CITY_CENTER[input.cityKey.toLowerCase()] ?? CITY_CENTER.istanbul;

  const baseSlug = slugify(input.businessName) || "isletme";
  const slug = `${baseSlug}-${user.id.slice(0, 6)}`;

  try {
    await dbQuery(
      `INSERT INTO public.businesses
         (profile_id, name, slug, category, city, district, address, phone, latitude, longitude, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)`,
      [
        user.id,
        input.businessName,
        slug,
        input.category,
        input.cityLabel,
        input.district,
        input.address,
        input.phone ?? null,
        lat,
        lng,
      ]
    );
    return { ok: true, slug };
  } catch (e) {
    console.error("[createBusiness] db error:", e);
    return {
      error: e instanceof Error ? e.message : "İşletme kaydı atılamadı",
    };
  }
}
