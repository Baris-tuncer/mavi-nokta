import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Plus,
  MapPin,
  TrendingUp,
  Clock,
  Eye,
} from "lucide-react";
import { getCurrentProfile } from "@/app/_actions/profile";
import { getMyBusiness, listMyCampaigns } from "@/app/_actions/campaign";
import { categoryMeta } from "@/lib/mock-campaigns";
import { formatPrice, cn } from "@/lib/utils";
import type { MockCategory } from "@/lib/mock-campaigns";

export default async function BusinessPanelPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/giris/isletme");
  if (profile.role !== "BUSINESS") redirect("/");

  const business = await getMyBusiness();

  // Henüz işletme satırı yoksa basit bir hatırlatma
  if (!business) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-mn-border bg-mn-surface p-8">
          <h1 className="text-2xl font-black tracking-tight text-mn-text">
            İşletme bilgilerin eksik
          </h1>
          <p className="mt-2 text-mn-text-soft">
            Hesabın işletme rolünde ama henüz bir işletme kaydı bağlı değil. Bu
            durumu hızlıca düzeltelim — `/kayit/isletme` formunu yeniden açıp
            doldurabilirsin (mevcut hesabın korunur).
          </p>
          <Link
            href="/kayit/isletme"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-mn-text px-5 py-2.5 text-sm font-semibold text-white hover:bg-black"
          >
            İşletme bilgilerini gir
          </Link>
        </div>
      </div>
    );
  }

  const campaigns = await listMyCampaigns();
  const active = campaigns.filter((c) => c.status === "ACTIVE");
  const drafts = campaigns.filter((c) => c.status === "DRAFT");
  const expired = campaigns.filter((c) =>
    ["EXPIRED", "PAUSED", "SOLD_OUT"].includes(c.status)
  );

  const cat = categoryMeta[business.category as MockCategory] ?? {
    label: business.category,
    emoji: "🏪",
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* İşletme başlığı */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-mn-text-mute">
            İşletme paneli
          </div>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-mn-text sm:text-4xl">
            {business.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-mn-text-soft">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-mn-border bg-mn-surface px-2.5 py-1">
              <span>{cat.emoji}</span>
              {cat.label}
            </span>
            <span className="inline-flex items-center gap-1.5 text-mn-text-soft">
              <MapPin className="h-3.5 w-3.5" />
              {business.city} · {business.district}
            </span>
          </div>
        </div>

        <Link
          href="/panel/isletme/yeni-kampanya"
          className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-mn-text px-5 text-sm font-semibold text-white transition hover:bg-black sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Yeni kampanya
        </Link>
      </div>

      {/* Stat şeridi */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat
          icon={<TrendingUp className="h-4 w-4 text-mn-blue" />}
          label="Aktif kampanya"
          value={active.length}
        />
        <Stat
          icon={<Clock className="h-4 w-4 text-mn-amber" />}
          label="Taslak"
          value={drafts.length}
        />
        <Stat
          icon={<Eye className="h-4 w-4 text-mn-text-mute" />}
          label="Geçmiş"
          value={expired.length}
        />
      </div>

      {/* Kampanyalar */}
      <div className="mt-12">
        <h2 className="text-xl font-black tracking-tight text-mn-text">
          Kampanyaların
        </h2>

        {campaigns.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => (
              <CampaignRow key={c.id} c={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-mn-border bg-mn-surface p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-mn-text-mute">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-3xl font-black text-mn-text">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-mn-border bg-mn-surface/50 p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-mn-blue-soft text-mn-blue">
        <Plus className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-mn-text">
        Henüz kampanya yok
      </h3>
      <p className="mt-1 text-sm text-mn-text-soft">
        İlk kampanyanı oluştur — sayaç başlasın, müşterin gelsin.
      </p>
      <Link
        href="/panel/isletme/yeni-kampanya"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-mn-text px-5 py-2.5 text-sm font-semibold text-white hover:bg-black"
      >
        İlk kampanyayı oluştur
      </Link>
    </div>
  );
}

function CampaignRow({
  c,
}: {
  c: Awaited<ReturnType<typeof listMyCampaigns>>[number];
}) {
  const oldPrice =
    typeof c.old_price === "string"
      ? parseFloat(c.old_price)
      : (c.old_price as number);
  const newPrice =
    typeof c.new_price === "string"
      ? parseFloat(c.new_price)
      : (c.new_price as number);
  const discount = Math.round((1 - newPrice / oldPrice) * 100);

  const ends = new Date(c.ends_at);
  const isLive =
    c.status === "ACTIVE" && ends.getTime() > Date.now();

  return (
    <div className="overflow-hidden rounded-2xl border border-mn-border bg-mn-surface">
      {c.image_url && (
        <div
          className="h-32 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${c.image_url})` }}
        />
      )}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              c.status === "ACTIVE"
                ? "bg-mn-blue-soft text-mn-blue"
                : c.status === "DRAFT"
                ? "bg-mn-amber/15 text-mn-amber"
                : "bg-mn-surface-2 text-mn-text-mute"
            )}
          >
            {c.status}
          </span>
          {c.is_surprise_package && (
            <span className="rounded-full bg-mn-eco/15 px-2 py-0.5 text-[10px] font-bold uppercase text-mn-eco">
              Sürpriz
            </span>
          )}
        </div>
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-mn-text">
          {c.slogan}
        </p>
        <div className="flex items-end justify-between border-t border-mn-border pt-2">
          <div className="text-xs text-mn-text-mute line-through">
            {formatPrice(oldPrice)}
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-mn-blue">
              {formatPrice(newPrice)}
            </div>
            <div className="text-[10px] text-mn-text-mute">
              %{discount} indirim
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] text-mn-text-mute">
          <span>
            {isLive
              ? `Bitiş: ${ends.toLocaleString("tr-TR")}`
              : c.status === "EXPIRED"
              ? "Süresi doldu"
              : `Başlangıç: ${new Date(c.starts_at).toLocaleString("tr-TR")}`}
          </span>
          {c.remaining_stock !== null && (
            <span>{c.remaining_stock} stok</span>
          )}
        </div>
      </div>
    </div>
  );
}
