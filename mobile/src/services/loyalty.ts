import { supabase } from "../lib/supabase";

export type MyLoyaltyCard = {
  id: string;
  programId: string;
  stampCount: number;
  stampTarget: number;
  rewardText: string;
  isRewardClaimed: boolean;
  business: {
    id: string;
    name: string;
    category: string;
    district: string;
  };
};

export type StampResult =
  | {
      ok: true;
      stampCount: number;
      stampTarget: number;
      rewardUnlocked: boolean;
      rewardText: string;
    }
  | { error: string };

// ── Customer Functions ──

export async function getMyLoyaltyCards(): Promise<MyLoyaltyCard[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("loyalty_cards")
    .select(
      `
      id, stamp_count, is_reward_claimed,
      loyalty_programs (
        id, stamp_target, reward_text,
        businesses ( id, name, category, district )
      )
    `
    )
    .eq("customer_id", user.id)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => {
    const lp = Array.isArray(row.loyalty_programs)
      ? row.loyalty_programs[0]
      : row.loyalty_programs;
    const b = lp
      ? Array.isArray(lp.businesses)
        ? lp.businesses[0]
        : lp.businesses
      : null;
    return {
      id: row.id,
      programId: lp?.id ?? "",
      stampCount: row.stamp_count,
      stampTarget: lp?.stamp_target ?? 10,
      rewardText: lp?.reward_text ?? "",
      isRewardClaimed: row.is_reward_claimed,
      business: {
        id: b?.id ?? "",
        name: b?.name ?? "",
        category: b?.category ?? "",
        district: b?.district ?? "",
      },
    };
  });
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

export async function getMyLoyaltyProgram() {
  const bizId = await getMyBusinessId();
  if (!bizId) return null;

  const { data } = await supabase
    .from("loyalty_programs")
    .select("*")
    .eq("business_id", bizId)
    .maybeSingle();

  return data;
}

export async function createOrUpdateLoyaltyProgram(input: {
  stampTarget: number;
  rewardText: string;
  isActive: boolean;
}): Promise<{ ok: boolean } | { error: string }> {
  const bizId = await getMyBusinessId();
  if (!bizId) return { error: "Isletme bulunamadi" };

  // Check if program exists
  const existing = await getMyLoyaltyProgram();

  if (existing) {
    const { error } = await supabase
      .from("loyalty_programs")
      .update({
        stamp_target: input.stampTarget,
        reward_text: input.rewardText,
        is_active: input.isActive,
      })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("loyalty_programs").insert({
      business_id: bizId,
      stamp_target: input.stampTarget,
      reward_text: input.rewardText,
      is_active: input.isActive,
    });
    if (error) return { error: error.message };
  }

  return { ok: true };
}

export async function addStamp(
  programId: string,
  customerId: string
): Promise<StampResult> {
  const { data, error } = await supabase.rpc("add_loyalty_stamp", {
    p_program_id: programId,
    p_customer_id: customerId,
  });

  if (error) return { error: error.message };

  const result = data as any;
  if (result?.error) return { error: result.error };

  return {
    ok: true,
    stampCount: result.stamp_count,
    stampTarget: result.stamp_target,
    rewardUnlocked: result.reward_unlocked,
    rewardText: result.reward_text,
  };
}

export async function claimReward(
  cardId: string
): Promise<{ ok: boolean } | { error: string }> {
  const { error } = await supabase
    .from("loyalty_cards")
    .update({ is_reward_claimed: true, stamp_count: 0 })
    .eq("id", cardId);

  if (error) return { error: error.message };
  return { ok: true };
}
