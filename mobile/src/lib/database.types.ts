/**
 * Supabase schema'mızı yansıtan TypeScript tipleri.
 * Schema değiştikçe `supabase gen types typescript` ile yeniden üretilebilir.
 * Şu an minimal manual tutuyoruz — gereken yerler eklendi.
 */

export type UserRole = "CUSTOMER" | "BUSINESS";

export type BusinessCategory =
  | "CAFE"
  | "BAKERY"
  | "PASTANE"
  | "RESTAURANT"
  | "FASTFOOD"
  | "TATLI"
  | "BUFE"
  | "KASAP"
  | "MANAV"
  | "MARKET"
  | "PUB"
  | "PETSHOP"
  | "PHARMACY"
  | "BEAUTY"
  | "FLORIST"
  | "GYM"
  | "VET"
  | "OTHER";

export type CampaignStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "EXPIRED"
  | "SOLD_OUT";

export type ClaimStatus = "RESERVED" | "REDEEMED" | "EXPIRED" | "CANCELLED";

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export type ReservationMode = "AUTO" | "MANUAL";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
  updatedat: string;
};

export type Customer = {
  profile_id: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

export type Business = {
  id: string;
  profile_id: string;
  name: string;
  slug: string;
  category: BusinessCategory;
  description: string | null;
  slogan: string | null;
  logo_url: string | null;
  cover_url: string | null;
  brand_color: string | null;
  phone: string | null;
  website: string | null;
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  is_verified: boolean;
  is_active: boolean;
  reservation_enabled: boolean;
  reservation_mode: ReservationMode;
  max_party_size: number;
  created_at: string;
  updated_at: string;
};

export type Campaign = {
  id: string;
  business_id: string;
  slogan: string;
  title: string;
  description: string | null;
  image_url: string | null;
  old_price: number;
  new_price: number;
  currency: string;
  starts_at: string;
  ends_at: string;
  total_stock: number | null;
  remaining_stock: number | null;
  per_user_limit: number;
  is_surprise_package: boolean;
  surprise_hint: string | null;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
};

export type Claim = {
  id: string;
  campaign_id: string;
  customer_id: string;
  code: string;
  qr_payload: string;
  status: ClaimStatus;
  reserved_at: string;
  redeemed_at: string | null;
  cancelled_at: string | null;
  expires_at: string;
  price_charged: number;
};

export type Reservation = {
  id: string;
  business_id: string;
  customer_id: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  status: ReservationStatus;
  note: string | null;
  reject_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type LoyaltyProgram = {
  id: string;
  business_id: string;
  stamp_target: number;
  reward_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type LoyaltyCard = {
  id: string;
  program_id: string;
  customer_id: string;
  stamp_count: number;
  is_reward_claimed: boolean;
  created_at: string;
  updated_at: string;
};

export type LoyaltyStamp = {
  id: string;
  card_id: string;
  stamped_at: string;
  stamped_by: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      customers: { Row: Customer; Insert: Partial<Customer>; Update: Partial<Customer> };
      businesses: { Row: Business; Insert: Partial<Business>; Update: Partial<Business> };
      campaigns: { Row: Campaign; Insert: Partial<Campaign>; Update: Partial<Campaign> };
      claims: { Row: Claim; Insert: Partial<Claim>; Update: Partial<Claim> };
      reservations: { Row: Reservation; Insert: Partial<Reservation>; Update: Partial<Reservation> };
      loyalty_programs: { Row: LoyaltyProgram; Insert: Partial<LoyaltyProgram>; Update: Partial<LoyaltyProgram> };
      loyalty_cards: { Row: LoyaltyCard; Insert: Partial<LoyaltyCard>; Update: Partial<LoyaltyCard> };
      loyalty_stamps: { Row: LoyaltyStamp; Insert: Partial<LoyaltyStamp>; Update: Partial<LoyaltyStamp> };
    };
    Enums: {
      user_role: UserRole;
      business_category: BusinessCategory;
      campaign_status: CampaignStatus;
      claim_status: ClaimStatus;
      reservation_status: ReservationStatus;
      reservation_mode: ReservationMode;
    };
  };
};
