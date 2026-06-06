import { supabase } from "../lib/supabase";
import { slugify } from "../lib/slug";
import { CITY_CENTER } from "../lib/constants";
import type { BusinessCategory } from "../lib/database.types";

export type CreateBusinessInput = {
  businessName: string;
  category: BusinessCategory;
  customCategory?: string;
  cityKey: string;
  cityLabel: string;
  district: string;
  address: string;
  phone?: string | null;
};

export async function createBusiness(input: CreateBusinessInput) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Auth gerekli");

  const [lat, lng] =
    CITY_CENTER[input.cityKey.toLowerCase()] ?? CITY_CENTER.istanbul;
  const baseSlug = slugify(input.businessName) || "isletme";
  const slug = `${baseSlug}-${user.id.slice(0, 6)}`;

  const row = {
    profile_id: user.id,
    name: input.businessName,
    slug,
    category: input.category,
    description:
      input.category === "OTHER" && input.customCategory
        ? input.customCategory
        : null,
    city: input.cityLabel,
    district: input.district,
    address: input.address,
    phone: input.phone,
    latitude: lat,
    longitude: lng,
    is_active: true,
  };

  // Retry up to 3 times on schema cache error
  const delays = [1500, 3000, 5000];
  let data: any = null;
  let error: any = null;

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    ({ data, error } = await supabase
      .from("businesses")
      .insert(row)
      .select()
      .single());

    if (!error) break;

    // Duplicate key = business already exists (previous attempt succeeded)
    if (error.code === "23505") {
      const existing = await getMyBusiness();
      if (existing) return { ok: true as const, slug: existing.slug };
    }

    if (error.message?.includes("schema cache") && attempt < delays.length) {
      await new Promise((r) => setTimeout(r, delays[attempt]));
      continue;
    }

    break;
  }

  if (error) throw error;
  return { ok: true as const, slug: data.slug };
}

export async function getMyBusiness() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  return data;
}
