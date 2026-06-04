import { dbQuery } from "@/lib/db/pool";
import type { MockCampaign, MockCategory } from "@/lib/mock-campaigns";

/**
 * Anasayfa için aktif kampanyalar — businesses ile join.
 * MockCampaign tipiyle uyumlu döner ki UI'ı değiştirmeden mock'tan geçiş kolay olsun.
 */
type Row = {
  id: string;
  slogan: string;
  title: string;
  description: string | null;
  image_url: string | null;
  old_price: string;
  new_price: string;
  starts_at: string;
  ends_at: string;
  total_stock: number | null;
  remaining_stock: number | null;
  is_surprise_package: boolean;
  business_id: string;
  business_name: string;
  business_slug: string;
  business_category: MockCategory;
  business_city: string;
  business_district: string;
  business_address: string;
  business_latitude: number;
  business_longitude: number;
  business_logo_url: string | null;
};

const FALLBACK_LOGO =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=96&q=80&auto=format&fit=crop";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80&auto=format&fit=crop";

function rowToCampaign(r: Row): MockCampaign {
  return {
    id: r.id,
    slug: r.id, // Adım 4b'de campaign'lerin kendi slug'ları olur, şu an id
    slogan: r.slogan,
    title: r.title,
    description: r.description ?? "",
    imageUrl: r.image_url ?? FALLBACK_IMAGE,
    oldPrice: parseFloat(r.old_price),
    newPrice: parseFloat(r.new_price),
    startsAt: new Date(r.starts_at),
    endsAt: new Date(r.ends_at),
    totalStock: r.total_stock,
    remainingStock: r.remaining_stock,
    isSurprisePackage: r.is_surprise_package,
    business: {
      name: r.business_name,
      slug: r.business_slug,
      category: r.business_category,
      city: r.business_city,
      district: r.business_district,
      address: r.business_address,
      latitude: r.business_latitude,
      longitude: r.business_longitude,
      logoUrl: r.business_logo_url ?? FALLBACK_LOGO,
    },
  };
}

export async function getActiveCampaignsForHomepage(): Promise<MockCampaign[]> {
  const { rows } = await dbQuery<Row>(
    `SELECT
       c.id, c.slogan, c.title, c.description, c.image_url,
       c.old_price, c.new_price, c.starts_at, c.ends_at,
       c.total_stock, c.remaining_stock, c.is_surprise_package,
       b.id AS business_id, b.name AS business_name, b.slug AS business_slug,
       b.category::text AS business_category, b.city AS business_city,
       b.district AS business_district, b.address AS business_address,
       b.latitude AS business_latitude, b.longitude AS business_longitude,
       b.logo_url AS business_logo_url
     FROM public.campaigns c
     JOIN public.businesses b ON b.id = c.business_id
     WHERE c.status = 'ACTIVE'
       AND c.ends_at > now()
       AND b.is_active = true
     ORDER BY c.ends_at ASC
     LIMIT 60`
  );
  return rows.map(rowToCampaign);
}
