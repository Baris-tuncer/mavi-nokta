"use server";

import { dbQuery } from "@/lib/db/pool";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/database.types";

/**
 * Login olan kullanıcının profile bilgisini getir (role + full_name vs.).
 * PostgREST yerine direkt pg üzerinden — supabase REST sorunlarından bağımsız.
 */
export async function getCurrentProfile(): Promise<{
  id: string;
  email: string;
  name: string;
  role: UserRole;
} | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { rows } = await dbQuery<Profile>(
    `SELECT id, role, full_name FROM public.profiles WHERE id = $1 LIMIT 1`,
    [user.id]
  );
  const profile = rows[0];

  return {
    id: user.id,
    email: user.email ?? "",
    name: profile?.full_name || user.email || "Kullanıcı",
    role: (profile?.role as UserRole) ?? "CUSTOMER",
  };
}

/**
 * Yeni signup sonrası profile'a ek bilgi yaz (phone, city).
 * Trigger zaten profiles satırını oluşturmuştu.
 */
export async function updateProfileExtras(input: {
  phone?: string | null;
  city?: string | null;
}): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Auth gerekli" };

  await dbQuery(
    `UPDATE public.profiles SET phone = $1, city = $2, updated_at = now() WHERE id = $3`,
    [input.phone ?? null, input.city ?? null, user.id]
  );
  return { ok: true };
}

/**
 * Customer profili (customers tablosunda) hazırla — yoksa oluştur.
 */
export async function ensureCustomerRow(): Promise<
  { ok: true } | { error: string }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Auth gerekli" };

  await dbQuery(
    `INSERT INTO public.customers (profile_id) VALUES ($1)
     ON CONFLICT (profile_id) DO NOTHING`,
    [user.id]
  );
  return { ok: true };
}
