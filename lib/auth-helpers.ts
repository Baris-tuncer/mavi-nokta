import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/database.types";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    name: profile?.full_name || user.email || "Kullanıcı",
    role: (profile?.role as UserRole) ?? "CUSTOMER",
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris/musteri");
  return user;
}

export async function requireRole(role: UserRole) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(role === "BUSINESS" ? "/giris/isletme" : "/giris/musteri");
  }
  if (user.role !== role) {
    redirect(user.role === "BUSINESS" ? "/panel/isletme" : "/");
  }
  return user;
}
