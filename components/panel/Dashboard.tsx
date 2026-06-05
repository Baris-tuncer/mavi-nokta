"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Clock,
  Gift,
  OctagonX,
  RotateCcw,
  Eye,
  Users,
  TrendingUp,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { categoryMeta, type MockCategory } from "@/lib/mock-campaigns";
import type {
  DashboardBusiness,
  DashboardCampaign,
  DashboardStats,
} from "@/lib/mock-dashboard";
import { QuickCampaignModal } from "./QuickCampaignModal";

/* ═══════════════════════════════════════════════════════════════
   UNSPLASH IMAGES
   ═══════════════════════════════════════════════════════════════ */
const IMG = {
  hero: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200&q=80&auto=format&fit=crop",
  cta: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80&auto=format&fit=crop",
  statActive:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&auto=format&fit=crop",
  statPeople:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80&auto=format&fit=crop",
  statViews:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80&auto=format&fit=crop",
  empty:
    "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=1200&q=80&auto=format&fit=crop",
  fallback:
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80&auto=format&fit=crop",
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
type Props = {
  business: DashboardBusiness;
  campaigns: DashboardCampaign[];
  stats: DashboardStats;
  isDemo: boolean;
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi günler";
  return "İyi akşamlar";
}

function useCountdown(endsAt: string) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, new Date(endsAt).getTime() - Date.now())
  );

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining(Math.max(0, new Date(endsAt).getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt, remaining]);

  if (remaining <= 0) return "Süre doldu";
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);
  if (h > 0) return `${h}sa ${m}dk`;
  if (m > 0) return `${m}dk ${s}sn`;
  return `${s}sn`;
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════════════ */
export function Dashboard({ business, campaigns, stats, isDemo }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [endedIds, setEndedIds] = useState<Set<string>>(new Set());

  const cat = categoryMeta[business.category as MockCategory] ?? {
    label: business.category,
    emoji: "",
  };

  const activeCampaigns = campaigns.filter(
    (c) => c.status === "ACTIVE" && !endedIds.has(c.id)
  );
  const pastCampaigns = campaigns.filter(
    (c) => c.status !== "ACTIVE" || endedIds.has(c.id)
  );

  function handleEarlyEnd(id: string) {
    if (!confirm("Bu kampanyayı erken bitirmek istediğinize emin misiniz?"))
      return;
    setEndedIds((prev) => new Set(prev).add(id));
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      {/* Demo banner */}
      {isDemo && (
        <div className="mb-5 rounded-2xl border border-amber-200/60 bg-amber-50/80 px-4 py-3 text-sm font-medium text-amber-700 backdrop-blur-sm">
          Demo modu — Caferağa Pastanesi&apos;nin örnek verileriyle
          geziniyorsunuz.
        </div>
      )}

      {/* ═══════════ HERO BANNER ═══════════ */}
      <div className="relative overflow-hidden rounded-3xl">
        <img
          src={IMG.hero}
          alt=""
          className="h-56 w-full object-cover sm:h-64"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <p className="text-sm font-medium text-white/70">
            {getGreeting()},{" "}
            <span className="font-semibold text-white">
              {business.ownerName}
            </span>
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {business.name}
          </h1>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md">
              {cat.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md">
              <MapPin className="h-3 w-3" />
              {business.district}, {business.city}
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════ STAT CARDS ═══════════ */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <GlassStatCard
          image={IMG.statActive}
          value={stats.activeCampaigns}
          label="Aktif Fırsat"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <GlassStatCard
          image={IMG.statPeople}
          value={stats.todayConversions}
          label="Bugün"
          suffix=" kişi"
          icon={<Users className="h-4 w-4" />}
        />
        <GlassStatCard
          image={IMG.statViews}
          value={stats.weeklyViews}
          label="Görüntüleme"
          icon={<Eye className="h-4 w-4" />}
        />
      </div>

      {/* ═══════════ CTA — Yeni Fırsat Yarat ═══════════ */}
      <button
        onClick={() => setModalOpen(true)}
        className="group relative mt-6 w-full overflow-hidden rounded-3xl text-left transition active:scale-[0.99]"
      >
        <img
          src={IMG.cta}
          alt=""
          className="h-24 w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
            <Plus className="h-6 w-6 text-white" />
          </span>
          <div className="ml-4 flex-1">
            <span className="text-lg font-bold text-white">
              Yeni Fırsat Yarat
            </span>
            <br />
            <span className="text-sm text-white/65">
              Saniyeler içinde yayına al
            </span>
          </div>
          <ChevronRight className="h-5 w-5 text-white/40" />
        </div>
      </button>

      {/* ═══════════ ACTIVE CAMPAIGNS ═══════════ */}
      {activeCampaigns.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-slate-800">
            Aktif Kampanyalar
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            {activeCampaigns.map((c) => (
              <ActiveCampaignCard
                key={c.id}
                campaign={c}
                onEarlyEnd={() => handleEarlyEnd(c.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ PAST CAMPAIGNS ═══════════ */}
      {pastCampaigns.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-slate-800">Geçmiş</h2>
          <div className="mt-4 flex flex-col gap-3">
            {pastCampaigns.map((c) => (
              <PastCampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ EMPTY STATE ═══════════ */}
      {campaigns.length === 0 && (
        <div className="relative mt-10 overflow-hidden rounded-3xl">
          <img
            src={IMG.empty}
            alt=""
            className="h-64 w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-2xl bg-white/20 p-6 backdrop-blur-xl">
              <h3 className="text-xl font-bold text-white">
                Henüz kampanya yok
              </h3>
              <p className="mt-2 text-sm text-white/70">
                İlk fırsatını oluştur, müşterin gelsin.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-white/90"
              >
                <Plus className="h-4 w-4" />
                İlk kampanyayı oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL ═══════════ */}
      {modalOpen && (
        <QuickCampaignModal
          isDemo={isDemo}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GLASS STAT CARD
   ═══════════════════════════════════════════════════════════════ */
function GlassStatCard({
  image,
  value,
  label,
  suffix,
  icon,
}: {
  image: string;
  value: number;
  label: string;
  suffix?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Photo */}
      <img src={image} alt="" className="h-28 w-full object-cover" />
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/65 backdrop-blur-xl" />
      {/* Content */}
      <div className="relative flex h-28 flex-col justify-end p-3.5">
        <div className="text-slate-500">{icon}</div>
        <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
          {value}
          {suffix && (
            <span className="ml-0.5 text-sm font-medium text-slate-400">
              {suffix}
            </span>
          )}
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACTIVE CAMPAIGN CARD
   ═══════════════════════════════════════════════════════════════ */
function ActiveCampaignCard({
  campaign: c,
  onEarlyEnd,
}: {
  campaign: DashboardCampaign;
  onEarlyEnd: () => void;
}) {
  const discount = Math.round((1 - c.newPrice / c.oldPrice) * 100);
  const stockPercent =
    c.totalStock && c.remainingStock != null
      ? (c.remainingStock / c.totalStock) * 100
      : null;
  const stockLow = stockPercent !== null && stockPercent <= 25;
  const imageUrl = c.imageUrl || IMG.fallback;

  return (
    <div className="overflow-hidden rounded-3xl shadow-sm shadow-black/5">
      {/* Image top */}
      <div className="relative h-44">
        <img
          src={imageUrl}
          alt={c.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Glass badges */}
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          <GlassPill color="emerald">Aktif</GlassPill>
          {c.isSurprisePackage && (
            <GlassPill color="purple">
              <Gift className="h-3 w-3" />
              Sürpriz
            </GlassPill>
          )}
          <CountdownBadge endsAt={c.endsAt} />
        </div>

        {/* Price on image */}
        <div className="absolute bottom-4 left-4 flex items-end gap-2">
          <span className="text-sm text-white/50 line-through">
            {formatPrice(c.oldPrice)}
          </span>
          <span className="text-2xl font-extrabold text-white">
            {formatPrice(c.newPrice)}
          </span>
          <span className="mb-0.5 rounded-md bg-red-500/80 px-1.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
            %{discount}
          </span>
        </div>
      </div>

      {/* Glass content bottom */}
      <div className="bg-white p-4">
        <p className="text-sm font-semibold leading-snug text-slate-800 line-clamp-2">
          {c.slogan}
        </p>

        {/* Stock bar */}
        {stockPercent !== null && (
          <div className="mt-3">
            <span
              className={cn(
                "text-[11px] font-medium",
                stockLow ? "text-red-500" : "text-slate-400"
              )}
            >
              {stockLow
                ? `Son ${c.remainingStock} paket!`
                : `${c.remainingStock}/${c.totalStock} stok`}
            </span>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(stockPercent, 3)}%`,
                  backgroundColor: stockLow ? "#EF4444" : "#3B82F6",
                }}
              />
            </div>
          </div>
        )}

        {/* Bottom row */}
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Eye className="h-3 w-3" />
            {c.views} görüntüleme
          </span>
          <button
            onClick={onEarlyEnd}
            className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50"
          >
            <OctagonX className="h-3 w-3" />
            Erken Bitir
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAST CAMPAIGN CARD
   ═══════════════════════════════════════════════════════════════ */
function PastCampaignCard({ campaign: c }: { campaign: DashboardCampaign }) {
  const imageUrl = c.imageUrl || IMG.fallback;

  return (
    <div className="flex items-center overflow-hidden rounded-2xl bg-white shadow-sm shadow-black/5">
      {/* Thumbnail */}
      <img
        src={imageUrl}
        alt={c.title}
        className="h-20 w-20 shrink-0 object-cover"
      />
      <div className="flex-1 min-w-0 px-4 py-3">
        <p className="truncate text-sm font-semibold text-slate-700">
          {c.slogan}
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
          <span>
            {formatPrice(c.oldPrice)} → {formatPrice(c.newPrice)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" />
            {c.conversions} dönüşüm
          </span>
        </div>
      </div>
      <button className="mr-3 shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GLASS PILL (Badges on photos)
   ═══════════════════════════════════════════════════════════════ */
function GlassPill({
  children,
  color,
}: {
  children: React.ReactNode;
  color?: "emerald" | "purple" | "amber" | "red";
}) {
  const colors = {
    emerald: "bg-emerald-500/20 text-emerald-100",
    purple: "bg-purple-500/20 text-purple-100",
    amber: "bg-amber-500/20 text-amber-100",
    red: "bg-red-500/25 text-red-100",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-md",
        color ? colors[color] : "bg-white/15 text-white/90"
      )}
    >
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COUNTDOWN BADGE (on photos)
   ═══════════════════════════════════════════════════════════════ */
function CountdownBadge({ endsAt }: { endsAt: string }) {
  const text = useCountdown(endsAt);
  const diff = new Date(endsAt).getTime() - Date.now();
  const isUrgent = diff > 0 && diff <= 30 * 60_000;

  return (
    <GlassPill color={isUrgent ? "red" : undefined}>
      <Clock className="h-3 w-3" />
      {text}
    </GlassPill>
  );
}
