"use client";

import { useState } from "react";
import {
  Store,
  TrendingUp,
  Users,
  DollarSign,
  Pause,
  Play,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserPlus,
  Megaphone,
  MapPin,
} from "lucide-react";
import { categoryMeta, type MockCategory } from "@/lib/mock-campaigns";
import type {
  AdminBusiness,
  AdminStats,
  AdminAction,
} from "@/lib/mock-admin";

/* ═══════════════════════════════════════════════════════════════
   IMAGES
   ═══════════════════════════════════════════════════════════════ */
const IMG = {
  statBiz:
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&auto=format&fit=crop",
  statCamp:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&auto=format&fit=crop",
  statUsers:
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80&auto=format&fit=crop",
  statRevenue:
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80&auto=format&fit=crop",
};

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
type Filter = "ALL" | "ACTIVE" | "SUSPENDED" | "PENDING";

type Props = {
  businesses: AdminBusiness[];
  stats: AdminStats;
  actions: AdminAction[];
  isDemo: boolean;
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "az once";
  if (mins < 60) return `${mins}dk once`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}sa once`;
  const days = Math.floor(hours / 24);
  return `${days}g once`;
}

const statusConfig = {
  ACTIVE: { label: "Aktif", color: "bg-emerald-500", textColor: "text-emerald-600" },
  SUSPENDED: { label: "Askida", color: "bg-red-500", textColor: "text-red-600" },
  PENDING: { label: "Beklemede", color: "bg-amber-500", textColor: "text-amber-600" },
};

const actionIcons = {
  APPROVE: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  REJECT: <XCircle className="h-4 w-4 text-red-500" />,
  SUSPEND: <AlertCircle className="h-4 w-4 text-amber-500" />,
  CAMPAIGN_ADDED: <Megaphone className="h-4 w-4 text-blue-500" />,
  USER_JOINED: <UserPlus className="h-4 w-4 text-purple-500" />,
};

/* ═══════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
   ═══════════════════════════════════════════════════════════════ */
export function AdminDashboard({ businesses, stats, actions, isDemo }: Props) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [suspendedIds, setSuspendedIds] = useState<Set<string>>(new Set());

  const filteredBusinesses = businesses.filter((b) => {
    const effectiveStatus = suspendedIds.has(b.id) ? "SUSPENDED" : b.status;
    if (filter === "ALL") return true;
    return effectiveStatus === filter;
  });

  function handleToggleSuspend(id: string, currentStatus: string) {
    if (currentStatus === "SUSPENDED" || suspendedIds.has(id)) {
      if (!confirm("Bu isletmeyi tekrar aktif etmek istediginize emin misiniz?")) return;
      setSuspendedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      if (!confirm("Bu isletmeyi askiya almak istediginize emin misiniz?")) return;
      setSuspendedIds((prev) => new Set(prev).add(id));
    }
  }

  const filters: { key: Filter; label: string }[] = [
    { key: "ALL", label: "Tumu" },
    { key: "ACTIVE", label: "Aktif" },
    { key: "SUSPENDED", label: "Askida" },
    { key: "PENDING", label: "Beklemede" },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 pt-6 sm:px-6">
      {/* Demo banner */}
      {isDemo && (
        <div className="mb-5 rounded-2xl border border-amber-200/60 bg-amber-50/80 px-4 py-3 text-sm font-medium text-amber-700 backdrop-blur-sm">
          Demo modu — Gercek admin verisi icin ADMIN rolune ihtiyaciniz var.
        </div>
      )}

      {/* Header */}
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
        Mavi Nokta Admin
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Platform yonetim paneli
      </p>

      {/* ═══════════ STAT CARDS ═══════════ */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <GlassStatCard
          image={IMG.statBiz}
          value={stats.totalBusinesses}
          label="Isletme"
          icon={<Store className="h-4 w-4" />}
        />
        <GlassStatCard
          image={IMG.statCamp}
          value={stats.activeCampaigns}
          label="Aktif Kampanya"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <GlassStatCard
          image={IMG.statUsers}
          value={stats.totalUsers}
          label="Kullanici"
          icon={<Users className="h-4 w-4" />}
        />
        <GlassStatCard
          image={IMG.statRevenue}
          value={stats.todayRevenue}
          label="Bugunun Geliri"
          prefix="₺"
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      {/* ═══════════ FILTER PILLS ═══════════ */}
      <div className="mt-8 flex gap-2 overflow-x-auto no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
              filter === f.key
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ═══════════ BUSINESSES ═══════════ */}
      <section className="mt-6">
        <h2 className="text-lg font-bold text-slate-800">
          Isletmeler
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {filteredBusinesses.map((b) => {
            const effectiveStatus = suspendedIds.has(b.id) ? "SUSPENDED" : b.status;
            const sConf = statusConfig[effectiveStatus];
            const cat = categoryMeta[b.category as MockCategory] ?? {
              label: b.category,
              emoji: "",
            };

            return (
              <div
                key={b.id}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-black/5"
              >
                {/* Image */}
                <div className="relative h-32">
                  <img
                    src={b.imageUrl}
                    alt={b.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                      {cat.emoji} {cat.label}
                    </span>
                  </div>
                  <div className="absolute right-3 top-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md ${
                      effectiveStatus === "ACTIVE" ? "bg-emerald-500/70" :
                      effectiveStatus === "SUSPENDED" ? "bg-red-500/70" :
                      "bg-amber-500/70"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full bg-white`} />
                      {sConf.label}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-slate-800">{b.name}</h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {b.district}, {b.city}
                    </span>
                    <span>{b.campaignCount} kampanya</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="h-3 w-3" />
                    {timeAgo(b.lastActive)}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleToggleSuspend(b.id, b.status)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        effectiveStatus === "SUSPENDED"
                          ? "border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          : "border border-red-200 text-red-500 hover:bg-red-50"
                      }`}
                    >
                      {effectiveStatus === "SUSPENDED" ? (
                        <>
                          <Play className="h-3 w-3" />
                          Aktif Et
                        </>
                      ) : (
                        <>
                          <Pause className="h-3 w-3" />
                          Askiya Al
                        </>
                      )}
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50">
                      <Eye className="h-3 w-3" />
                      Detay
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredBusinesses.length === 0 && (
          <p className="mt-6 text-center text-sm text-slate-400">
            Bu filtreye uyan isletme bulunamadi.
          </p>
        )}
      </section>

      {/* ═══════════ RECENT ACTIONS ═══════════ */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-800">Son Islemler</h2>
        <div className="mt-4 flex flex-col gap-2">
          {actions.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm shadow-black/5"
            >
              {actionIcons[a.type]}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">
                  {a.description}
                  {a.businessName && (
                    <span className="font-semibold"> — {a.businessName}</span>
                  )}
                </p>
              </div>
              <span className="shrink-0 text-[11px] text-slate-400">
                {timeAgo(a.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GLASS STAT CARD (same pattern as Dashboard)
   ═══════════════════════════════════════════════════════════════ */
function GlassStatCard({
  image,
  value,
  label,
  prefix,
  icon,
}: {
  image: string;
  value: number;
  label: string;
  prefix?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <img src={image} alt="" className="h-28 w-full object-cover" />
      <div className="absolute inset-0 bg-white/65 backdrop-blur-xl" />
      <div className="relative flex h-28 flex-col justify-end p-3.5">
        <div className="text-slate-500">{icon}</div>
        <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
          {prefix}
          {value.toLocaleString("tr-TR")}
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </div>
      </div>
    </div>
  );
}
