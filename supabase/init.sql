-- =====================================================
-- Mavi Nokta — Supabase init.sql
-- Tek seferlik: Supabase Dashboard → SQL Editor → New query
-- → tüm dosyayı yapıştır → Run
-- =====================================================

-- 1) Yardımcı fonksiyon: updated_at otomatik güncellesin
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) Enum tipleri
do $$ begin
  create type public.user_role as enum ('CUSTOMER', 'BUSINESS');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.business_category as enum
    ('MARKET', 'CAFE', 'RESTAURANT', 'BAKERY', 'PUB', 'OTHER');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.campaign_status as enum
    ('DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'SOLD_OUT');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.claim_status as enum
    ('RESERVED', 'REDEEMED', 'EXPIRED', 'CANCELLED');
exception when duplicate_object then null; end $$;

-- =====================================================
-- TABLOLAR
-- =====================================================

-- 3) profiles — auth.users ile 1-1
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        public.user_role not null default 'CUSTOMER',
  full_name   text,
  phone       text,
  city        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- 4) Auth signup → otomatik profile satırı
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role := coalesce(
    nullif(new.raw_user_meta_data->>'role', '')::public.user_role,
    'CUSTOMER'
  );
  v_full_name text := coalesce(new.raw_user_meta_data->>'full_name', '');
begin
  insert into public.profiles (id, role, full_name)
  values (new.id, v_role, v_full_name)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5) customers — Customer profili için ek alanlar
create table if not exists public.customers (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  latitude   double precision,
  longitude  double precision,
  created_at timestamptz not null default now()
);

-- 6) businesses
create table if not exists public.businesses (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  name         text not null,
  slug         text not null unique,
  category     public.business_category not null,
  description  text,
  slogan       text,
  logo_url     text,
  cover_url    text,
  brand_color  text,
  phone        text,
  website      text,
  address      text not null,
  city         text not null,
  district     text not null,
  latitude     double precision not null,
  longitude    double precision not null,
  is_verified  boolean not null default false,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create unique index if not exists businesses_one_per_profile
  on public.businesses(profile_id);
create index if not exists businesses_category_idx
  on public.businesses(category);
create index if not exists businesses_city_district_idx
  on public.businesses(city, district);
create index if not exists businesses_geo_idx
  on public.businesses(latitude, longitude);

drop trigger if exists businesses_updated_at on public.businesses;
create trigger businesses_updated_at
  before update on public.businesses
  for each row execute function public.handle_updated_at();

-- 7) campaigns
create table if not exists public.campaigns (
  id                   uuid primary key default gen_random_uuid(),
  business_id          uuid not null references public.businesses(id) on delete cascade,
  slogan               text not null,
  title                text not null,
  description          text,
  image_url            text,
  old_price            numeric(10, 2) not null,
  new_price            numeric(10, 2) not null,
  currency             text not null default 'TRY',
  starts_at            timestamptz not null,
  ends_at              timestamptz not null,
  total_stock          integer,
  remaining_stock      integer,
  per_user_limit       integer not null default 1,
  is_surprise_package  boolean not null default false,
  surprise_hint        text,
  status               public.campaign_status not null default 'DRAFT',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists campaigns_business_idx
  on public.campaigns(business_id);
create index if not exists campaigns_status_ends_idx
  on public.campaigns(status, ends_at);
create index if not exists campaigns_surprise_idx
  on public.campaigns(is_surprise_package);

drop trigger if exists campaigns_updated_at on public.campaigns;
create trigger campaigns_updated_at
  before update on public.campaigns
  for each row execute function public.handle_updated_at();

-- 8) claims (QR doğrulama)
create table if not exists public.claims (
  id             uuid primary key default gen_random_uuid(),
  campaign_id    uuid not null references public.campaigns(id) on delete cascade,
  customer_id    uuid not null references public.profiles(id) on delete cascade,
  code           text not null unique,
  qr_payload     text not null unique,
  status         public.claim_status not null default 'RESERVED',
  reserved_at    timestamptz not null default now(),
  redeemed_at    timestamptz,
  cancelled_at   timestamptz,
  expires_at     timestamptz not null,
  price_charged  numeric(10, 2) not null
);
create index if not exists claims_campaign_idx
  on public.claims(campaign_id);
create index if not exists claims_customer_idx
  on public.claims(customer_id);
create index if not exists claims_status_idx
  on public.claims(status);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

alter table public.profiles   enable row level security;
alter table public.customers  enable row level security;
alter table public.businesses enable row level security;
alter table public.campaigns  enable row level security;
alter table public.claims     enable row level security;

-- profiles
drop policy if exists "profiles_self_read"   on public.profiles;
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_read"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles_self_update"
  on public.profiles for update using (auth.uid() = id);

-- customers
drop policy if exists "customers_self_all" on public.customers;
create policy "customers_self_all"
  on public.customers for all using (auth.uid() = profile_id);

-- businesses
drop policy if exists "businesses_public_read" on public.businesses;
drop policy if exists "businesses_owner_all"   on public.businesses;
create policy "businesses_public_read"
  on public.businesses for select using (is_active = true);
create policy "businesses_owner_all"
  on public.businesses for all using (auth.uid() = profile_id);

-- campaigns
drop policy if exists "campaigns_public_read" on public.campaigns;
drop policy if exists "campaigns_owner_all"   on public.campaigns;
create policy "campaigns_public_read"
  on public.campaigns for select using (status = 'ACTIVE');
create policy "campaigns_owner_all"
  on public.campaigns for all using (
    business_id in (
      select id from public.businesses where profile_id = auth.uid()
    )
  );

-- claims
drop policy if exists "claims_customer_select"   on public.claims;
drop policy if exists "claims_customer_insert"   on public.claims;
drop policy if exists "claims_business_select"   on public.claims;
drop policy if exists "claims_business_update"   on public.claims;

create policy "claims_customer_select"
  on public.claims for select using (auth.uid() = customer_id);
create policy "claims_customer_insert"
  on public.claims for insert with check (auth.uid() = customer_id);
create policy "claims_business_select"
  on public.claims for select using (
    campaign_id in (
      select c.id from public.campaigns c
      join public.businesses b on c.business_id = b.id
      where b.profile_id = auth.uid()
    )
  );
create policy "claims_business_update"
  on public.claims for update using (
    campaign_id in (
      select c.id from public.campaigns c
      join public.businesses b on c.business_id = b.id
      where b.profile_id = auth.uid()
    )
  );
