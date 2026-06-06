import { supabase } from "../lib/supabase";

export async function getCurrentProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone, city")
    .eq("id", user.id)
    .single();

  return profile
    ? {
        id: user.id,
        email: user.email ?? "",
        name: profile.full_name || user.email || "Kullanici",
        role: profile.role,
      }
    : null;
}

export async function updateProfileExtras(
  fullName?: string,
  phone?: string,
  city?: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Auth gerekli");

  const updates: Record<string, string> = {};
  if (fullName) updates.full_name = fullName;
  if (phone) updates.phone = phone;
  if (city) updates.city = city;

  return supabase.from("profiles").update(updates).eq("id", user.id);
}

export async function ensureCustomerRow() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Auth gerekli");

  return supabase
    .from("customers")
    .upsert({ profile_id: user.id }, { onConflict: "profile_id" });
}
