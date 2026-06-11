import { supabase } from "../lib/supabase";
import type { ReservationStatus, ReservationMode } from "../lib/database.types";

export type MyReservation = {
  id: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  status: ReservationStatus;
  note: string | null;
  rejectReason: string | null;
  createdAt: string;
  business: {
    id: string;
    name: string;
    category: string;
    district: string;
    address: string;
  };
};

export type BusinessReservation = {
  id: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  status: ReservationStatus;
  note: string | null;
  rejectReason: string | null;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    phone: string | null;
  };
};

export type ReservationResult =
  | { ok: true; status: ReservationStatus }
  | { error: string };

// ── Customer Functions ──

export async function createReservation(input: {
  businessId: string;
  date: string;
  time: string;
  partySize: number;
  note?: string;
}): Promise<ReservationResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Giris yapmaniz gerekiyor" };

  // Fetch business settings
  const { data: biz, error: bizErr } = await supabase
    .from("businesses")
    .select("id, reservation_enabled, reservation_mode, max_party_size")
    .eq("id", input.businessId)
    .single();

  if (bizErr || !biz) return { error: "Isletme bulunamadi" };
  if (!biz.reservation_enabled) return { error: "Bu isletme rezervasyon kabul etmiyor" };
  if (input.partySize > biz.max_party_size) {
    return { error: `Maksimum ${biz.max_party_size} kisi` };
  }

  const status: ReservationStatus =
    biz.reservation_mode === "AUTO" ? "CONFIRMED" : "PENDING";

  const { error: insertErr } = await supabase.from("reservations").insert({
    business_id: input.businessId,
    customer_id: user.id,
    reservation_date: input.date,
    reservation_time: input.time,
    party_size: input.partySize,
    status,
    note: input.note || null,
  });

  if (insertErr) return { error: insertErr.message };
  return { ok: true, status };
}

export async function getMyReservations(): Promise<MyReservation[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("reservations")
    .select(
      `
      id, reservation_date, reservation_time, party_size,
      status, note, reject_reason, created_at,
      businesses ( id, name, category, district, address )
    `
    )
    .eq("customer_id", user.id)
    .order("reservation_date", { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => {
    const b = Array.isArray(row.businesses)
      ? row.businesses[0]
      : row.businesses;
    return {
      id: row.id,
      reservationDate: row.reservation_date,
      reservationTime: row.reservation_time,
      partySize: row.party_size,
      status: row.status,
      note: row.note,
      rejectReason: row.reject_reason,
      createdAt: row.created_at,
      business: {
        id: b?.id ?? "",
        name: b?.name ?? "",
        category: b?.category ?? "",
        district: b?.district ?? "",
        address: b?.address ?? "",
      },
    };
  });
}

export async function cancelReservation(
  id: string
): Promise<{ ok: boolean } | { error: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Giris yapmaniz gerekiyor" };

  const { error } = await supabase
    .from("reservations")
    .update({ status: "CANCELLED" as ReservationStatus })
    .eq("id", id)
    .eq("customer_id", user.id)
    .in("status", ["PENDING", "CONFIRMED"]);

  if (error) return { error: error.message };
  return { ok: true };
}

// ── Business Functions ──

async function getMyBusinessId(): Promise<string | null> {
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

export async function getBusinessReservations(options?: {
  status?: ReservationStatus;
  date?: string;
}): Promise<BusinessReservation[]> {
  const bizId = await getMyBusinessId();
  if (!bizId) return [];

  let query = supabase
    .from("reservations")
    .select(
      `
      id, reservation_date, reservation_time, party_size,
      status, note, reject_reason, created_at,
      profiles:customer_id ( id, full_name, phone )
    `
    )
    .eq("business_id", bizId)
    .order("reservation_date", { ascending: true })
    .order("reservation_time", { ascending: true });

  if (options?.status) {
    query = query.eq("status", options.status);
  }
  if (options?.date) {
    query = query.eq("reservation_date", options.date);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row: any) => {
    const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id,
      reservationDate: row.reservation_date,
      reservationTime: row.reservation_time,
      partySize: row.party_size,
      status: row.status,
      note: row.note,
      rejectReason: row.reject_reason,
      createdAt: row.created_at,
      customer: {
        id: p?.id ?? "",
        name: p?.full_name ?? "Misafir",
        phone: p?.phone ?? null,
      },
    };
  });
}

export async function updateReservationStatus(
  reservationId: string,
  status: "CONFIRMED" | "REJECTED" | "COMPLETED",
  rejectReason?: string
): Promise<{ ok: boolean } | { error: string }> {
  const bizId = await getMyBusinessId();
  if (!bizId) return { error: "Isletme bulunamadi" };

  const updateData: Record<string, any> = { status };
  if (rejectReason) updateData.reject_reason = rejectReason;

  const { error } = await supabase
    .from("reservations")
    .update(updateData)
    .eq("id", reservationId)
    .eq("business_id", bizId);

  if (error) return { error: error.message };
  return { ok: true };
}

export async function updateReservationSettings(settings: {
  reservationEnabled: boolean;
  reservationMode: ReservationMode;
  maxPartySize: number;
}): Promise<{ ok: boolean } | { error: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Giris yapmaniz gerekiyor" };

  const { error } = await supabase
    .from("businesses")
    .update({
      reservation_enabled: settings.reservationEnabled,
      reservation_mode: settings.reservationMode,
      max_party_size: settings.maxPartySize,
    })
    .eq("profile_id", user.id);

  if (error) return { error: error.message };
  return { ok: true };
}
