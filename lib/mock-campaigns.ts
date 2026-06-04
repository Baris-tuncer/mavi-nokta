// Adım 2 görsel onayı için sahte veri.
// Adım 3+ ile birlikte Prisma'ya bağlandığında bu dosya kalkacak.

export type MockCategory =
  | "CAFE"
  | "BAKERY"
  | "RESTAURANT"
  | "MARKET"
  | "PUB";

export type MockCampaign = {
  id: string;
  slug: string;
  slogan: string;
  title: string;
  description: string;
  imageUrl: string; // Unsplash CDN — gerçek fotoğraf
  oldPrice: number;
  newPrice: number;
  startsAt: Date;
  endsAt: Date;
  totalStock: number | null;
  remainingStock: number | null;
  isSurprisePackage: boolean;
  business: {
    name: string;
    slug: string;
    category: MockCategory;
    city: string;
    district: string;
    address: string;
    latitude: number;
    longitude: number;
    logoUrl: string;
  };
};

const now = Date.now();
const minutes = (n: number) => new Date(now + n * 60_000);

// Unsplash CDN — w/q parametreleri ile optimize boyut
const u = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const mockCampaigns: MockCampaign[] = [
  {
    id: "c1",
    slug: "kahve-ustasi-filtre",
    slogan: "Bugün 14:00–16:00 arası filtre kahve yarı fiyatına",
    title: "Filtre Kahve",
    description: "Tek menşe Etiyopya çekirdekleri, taze kavrulmuş.",
    imageUrl: u("photo-1495474472287-4d71bcdd2085"),
    oldPrice: 100,
    newPrice: 50,
    startsAt: minutes(-30),
    endsAt: minutes(95),
    totalStock: 50,
    remainingStock: 12,
    isSurprisePackage: false,
    business: {
      name: "Kahve Ustası",
      slug: "kahve-ustasi",
      category: "CAFE",
      city: "İstanbul",
      district: "Beşiktaş",
      address: "Sinanpaşa Mh., Beşiktaş",
      latitude: 41.0426,
      longitude: 29.0083,
      logoUrl: u("photo-1559925393-8be0ec4767c8", 96),
    },
  },
  {
    id: "c2",
    slug: "firin-selim-surpriz",
    slogan: "Gün sonu sıfır atık paketi — içinde ne çıkacağı sürpriz",
    title: "Sürpriz Fırın Paketi",
    description: "Akşamdan kalan ekmek, simit ve poğaçalardan oluşan rastgele paket.",
    imageUrl: u("photo-1509440159596-0249088772ff"),
    oldPrice: 90,
    newPrice: 30,
    startsAt: minutes(-10),
    endsAt: minutes(180),
    totalStock: 20,
    remainingStock: 4,
    isSurprisePackage: true,
    business: {
      name: "Fırın Selim",
      slug: "firin-selim",
      category: "BAKERY",
      city: "İstanbul",
      district: "Kadıköy",
      address: "Caferağa Mh., Kadıköy",
      latitude: 40.9879,
      longitude: 29.0254,
      logoUrl: u("photo-1568254183919-78a4f43a2877", 96),
    },
  },
  {
    id: "c3",
    slug: "la-pasta-aksam",
    slogan: "Bu akşam pasta menüsü %40 indirimli — son masalar",
    title: "Akşam Pasta Menüsü",
    description: "Başlangıç + ana yemek + ev yapımı tatlı.",
    imageUrl: u("photo-1473093295043-cdd812d0e601"),
    oldPrice: 450,
    newPrice: 270,
    startsAt: minutes(-60),
    endsAt: minutes(45),
    totalStock: 30,
    remainingStock: 6,
    isSurprisePackage: false,
    business: {
      name: "La Pasta",
      slug: "la-pasta",
      category: "RESTAURANT",
      city: "İstanbul",
      district: "Cihangir",
      address: "Kılıçali Paşa Mh., Cihangir",
      latitude: 41.0316,
      longitude: 28.9809,
      logoUrl: u("photo-1555396273-367ea4eb4db5", 96),
    },
  },
  {
    id: "c4",
    slug: "underground-happy-hour",
    slogan: "Happy Hour başladı — bira 80₺ yerine 40₺",
    title: "Happy Hour Bira",
    description: "Tüm fıçı biralarda %50 indirim, sadece bu saatlerde.",
    imageUrl: u("photo-1568644396922-5c3bfae12521"),
    oldPrice: 80,
    newPrice: 40,
    startsAt: minutes(-15),
    endsAt: minutes(105),
    totalStock: null,
    remainingStock: null,
    isSurprisePackage: false,
    business: {
      name: "Underground Pub",
      slug: "underground-pub",
      category: "PUB",
      city: "İstanbul",
      district: "Karaköy",
      address: "Kemankeş Mh., Karaköy",
      latitude: 41.0245,
      longitude: 28.9772,
      logoUrl: u("photo-1535958636474-b021ee887b13", 96),
    },
  },
  {
    id: "c5",
    slug: "tatlici-cihan-profiterol",
    slogan: "Bugüne özel — ev yapımı profiterol 80₺ yerine 35₺",
    title: "Profiterol",
    description: "200g porsiyon, ev yapımı çikolata sosu.",
    imageUrl: u("photo-1551024506-0bccd828d307"),
    oldPrice: 80,
    newPrice: 35,
    startsAt: minutes(-5),
    endsAt: minutes(240),
    totalStock: 40,
    remainingStock: 22,
    isSurprisePackage: false,
    business: {
      name: "Tatlıcı Cihan",
      slug: "tatlici-cihan",
      category: "CAFE",
      city: "İstanbul",
      district: "Şişli",
      address: "Mecidiyeköy, Şişli",
      latitude: 41.0667,
      longitude: 28.9929,
      logoUrl: u("photo-1551024601-bec78aea704b", 96),
    },
  },
  {
    id: "c6",
    slug: "migros-express-temel-paket",
    slogan: "Akşam fırsatı — süt-yumurta-ekmek paketi 150₺ yerine 99₺",
    title: "Temel İhtiyaç Paketi",
    description: "1L süt + 10 yumurta + 1 somun ekmek.",
    imageUrl: u("photo-1542838132-92c53300491e"),
    oldPrice: 150,
    newPrice: 99,
    startsAt: minutes(-90),
    endsAt: minutes(20),
    totalStock: 100,
    remainingStock: 7,
    isSurprisePackage: false,
    business: {
      name: "Migros Express",
      slug: "migros-express-besiktas",
      category: "MARKET",
      city: "İstanbul",
      district: "Beşiktaş",
      address: "Levent Cd., Beşiktaş",
      latitude: 41.0501,
      longitude: 29.0030,
      logoUrl: u("photo-1604719312566-8912e9227c6a", 96),
    },
  },
  {
    id: "c7",
    slug: "gozleme-anne-surpriz",
    slogan: "Gün sonu sürpriz — kalan gözlemeler 70₺ yerine 30₺",
    title: "Sürpriz Gözleme Paketi",
    description: "Peynirli, kıymalı veya patatesli — hangisi kalırsa.",
    imageUrl: u("photo-1601050690597-df0568f70950"),
    oldPrice: 70,
    newPrice: 30,
    startsAt: minutes(-20),
    endsAt: minutes(75),
    totalStock: 15,
    remainingStock: 3,
    isSurprisePackage: true,
    business: {
      name: "Gözleme Anne",
      slug: "gozleme-anne",
      category: "RESTAURANT",
      city: "İstanbul",
      district: "Üsküdar",
      address: "Mimar Sinan Mh., Üsküdar",
      latitude: 41.0233,
      longitude: 29.0152,
      logoUrl: u("photo-1556909114-f6e7ad7d3136", 96),
    },
  },
  {
    id: "c8",
    slug: "fit-cafe-smoothie",
    slogan: "Spor sonrası smoothie + protein topu kombosu yarı fiyatına",
    title: "Smoothie + Protein Combo",
    description: "Muz-fıstık ezmesi smoothie + tarçınlı protein topu.",
    imageUrl: u("photo-1502741126161-b048400d085d"),
    oldPrice: 90,
    newPrice: 45,
    startsAt: minutes(-45),
    endsAt: minutes(150),
    totalStock: 25,
    remainingStock: 11,
    isSurprisePackage: false,
    business: {
      name: "Fit Cafe",
      slug: "fit-cafe",
      category: "CAFE",
      city: "İstanbul",
      district: "Levent",
      address: "Levent Mh., Beşiktaş",
      latitude: 41.0814,
      longitude: 29.0094,
      logoUrl: u("photo-1521017432531-fbd92d768814", 96),
    },
  },
];

export const categoryMeta: Record<MockCategory, { label: string; emoji: string }> = {
  CAFE: { label: "Cafe", emoji: "☕" },
  BAKERY: { label: "Fırın", emoji: "🥖" },
  RESTAURANT: { label: "Restoran", emoji: "🍝" },
  MARKET: { label: "Market", emoji: "🛒" },
  PUB: { label: "Pub", emoji: "🍺" },
};

// =====================================================
//  Konum verisi — şehir / ilçe seçici için
//  Şu an İstanbul'un fırsat olan ilçeleri ile sınırlı.
// =====================================================

export type CityKey = "istanbul" | "ankara" | "izmir" | "bursa" | "antalya";

export const cities: { key: CityKey; label: string; districts: string[] }[] = [
  {
    key: "istanbul",
    label: "İstanbul",
    districts: [
      "Tüm ilçeler",
      "Beşiktaş",
      "Kadıköy",
      "Şişli",
      "Cihangir",
      "Karaköy",
      "Üsküdar",
      "Levent",
    ],
  },
  { key: "ankara",   label: "Ankara",   districts: ["Tüm ilçeler", "Çankaya", "Kızılay", "Bahçelievler"] },
  { key: "izmir",    label: "İzmir",    districts: ["Tüm ilçeler", "Konak", "Karşıyaka", "Bornova"] },
  { key: "bursa",    label: "Bursa",    districts: ["Tüm ilçeler", "Nilüfer", "Osmangazi"] },
  { key: "antalya",  label: "Antalya",  districts: ["Tüm ilçeler", "Muratpaşa", "Konyaaltı"] },
];
