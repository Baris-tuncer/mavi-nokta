"use client";

import { Fragment, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ChevronDown,
  MapPin,
  Gift,
  Flame,
  ShoppingBag,
  Leaf,
  ArrowRight,
  Sparkles,
  Timer,
  Map as MapIcon,
} from "lucide-react";
import {
  type MockCampaign,
  type MockCategory,
  categoryMeta,
} from "@/lib/mock-campaigns";
import { cn, formatPrice } from "@/lib/utils";
import { CountdownTimer } from "@/components/CountdownTimer";
import { NearbyPanel } from "@/components/NearbyPanel";

/* ═══════════════════════════════════════════════════════
   Unsplash — cinematic hero + section backgrounds
   ═══════════════════════════════════════════════════════ */
const HERO_IMG =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=85&auto=format&fit=crop";
const SURPRISE_IMG =
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&q=80&auto=format&fit=crop";

/* ── Slogan (word-by-word animation) ── */
const SLOGAN_L1 = ["Çevrendeki", "anlık", "fırsatlar,"];
const SLOGAN_L2 = ["tek", "noktada."];

/* ── Category pills with mini photos ── */
type Filter = "ALL" | MockCategory;
const PILL_ORDER: Filter[] = [
  "ALL",
  "CAFE",
  "RESTAURANT",
  "BAKERY",
  "MARKET",
  "PUB",
  "PHARMACY",
  "PETSHOP",
];
const PILL_IMG: Record<Filter, string> = {
  ALL: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=80&auto=format&fit=crop",
  CAFE: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&q=80&auto=format&fit=crop",
  RESTAURANT:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80&auto=format&fit=crop",
  BAKERY:
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80&auto=format&fit=crop",
  MARKET:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80&auto=format&fit=crop",
  PUB: "https://images.unsplash.com/photo-1568644396922-5c3bfae12521?w=200&q=80&auto=format&fit=crop",
  PHARMACY:
    "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=200&q=80&auto=format&fit=crop",
  PETSHOP:
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&q=80&auto=format&fit=crop",
};

/* ── Framer Motion variants ── */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
};

/* ═══════════════════════════════════════════════════════
   HomePage — entry component
   ═══════════════════════════════════════════════════════ */
type Props = {
  campaigns: MockCampaign[];
  usingReal: boolean;
};

export function HomePage({ campaigns, usingReal }: Props) {
  const [filter, setFilter] = useState<Filter>("ALL");

  /* Parallax on hero */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  /* Campaign lists */
  const active = campaigns
    .filter((c) => !c.isSurprisePackage)
    .filter(
      (c) => filter === "ALL" || c.business.category === filter
    )
    .sort((a, b) => a.endsAt.getTime() - b.endsAt.getTime());

  const surprise = campaigns.filter((c) => c.isSurprisePackage);

  return (
    <>
      {/* ─────────────── CINEMATIC HERO ─────────────── */}
      <section
        ref={heroRef}
        className="relative -mt-16 min-h-screen w-full overflow-hidden"
      >
        {/* Background photo with parallax zoom */}
        <motion.div className="absolute inset-0" style={{ scale: heroScale }}>
          <Image
            src={HERO_IMG}
            alt="Lezzetli yemekler"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>

        {/* Dark cinematic gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/45 to-black/75" />

        {/* Hero content — fades out on scroll */}
        <motion.div
          className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center"
          style={{ opacity: heroOpacity }}
        >
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8 inline-flex items-center gap-2.5 rounded-full bg-white/10 px-5 py-2.5 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-sm font-medium text-white/80">
              {"İstanbul'da şu an "}
              <strong className="text-white">324</strong>
              {" aktif fırsat"}
            </span>
          </motion.div>

          {/* Slogan — word by word */}
          <h1 className="text-center text-5xl font-black leading-tight tracking-tight text-white sm:text-7xl lg:text-8xl">
            {SLOGAN_L1.map((w, i) => (
              <Fragment key={`a${i}`}>
                <motion.span
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.5 + i * 0.16,
                    duration: 0.75,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ display: "inline-block" }}
                >
                  {w}
                </motion.span>
                {" "}
              </Fragment>
            ))}
            <br />
            {SLOGAN_L2.map((w, i) => (
              <Fragment key={`b${i}`}>
                <motion.span
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.5 + (SLOGAN_L1.length + i) * 0.16,
                    duration: 0.75,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ display: "inline-block" }}
                  className={w === "noktada." ? "text-blue-400" : undefined}
                >
                  {w}
                </motion.span>
                {" "}
              </Fragment>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.7 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/60 sm:text-xl"
          >
            Cafe, restoran, fırın ve marketlerin zaman duyarlı kampanyaları.
            <br className="hidden sm:block" />
            Sayaç dolmadan kap — sürpriz paketleri kurtar.
          </motion.p>

          {/* Glass stat pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.7 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            {[
              {
                Icon: Timer,
                value: "≤ 2 saat",
                label: "ortalama süre",
              },
              {
                Icon: Leaf,
                value: "2.4 ton",
                label: "kurtarılan yemek",
              },
              {
                Icon: Sparkles,
                value: "%63",
                label: "ortalama indirim",
              },
            ].map((s) => (
              <div
                key={s.value}
                className="flex items-center gap-2.5 rounded-full bg-white/10 px-5 py-2.5 backdrop-blur-md"
              >
                <s.Icon className="h-4 w-4 text-white/50" />
                <span className="text-sm font-bold text-white">
                  {s.value}
                </span>
                <span className="text-xs text-white/40">{s.label}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1, duration: 0.7 }}
            className="mt-10 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="#firsatlar"
              className="inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-base font-bold text-slate-900 shadow-lg transition hover:shadow-xl active:scale-[0.98]"
            >
              <Sparkles className="h-5 w-5" />
              Fırsatları Keşfet
            </Link>
            <Link
              href="/giris/isletme"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              İşletme misin? Ücretsiz başla
            </Link>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8 }}
            className="mt-auto pb-8 pt-10"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex flex-col items-center gap-1.5"
            >
              <span className="text-[11px] font-medium uppercase tracking-widest text-white/30">
                Aşağı kaydır
              </span>
              <ChevronDown className="h-5 w-5 text-white/30" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─────────────── CONTENT — Apple light bg ─────────────── */}
      <div className="bg-[#F5F5F7]">
        {/* Demo banner */}
        {!usingReal && (
          <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-amber-200/50 bg-white/70 px-5 py-3.5 text-sm text-slate-600 backdrop-blur-md">
              <strong className="text-amber-600">Demo modu:</strong> şu an
              önyüklenmiş örnek kampanyalar gösteriliyor.
            </div>
          </div>
        )}

        {/* ── Category pills (photo thumbnails) ── */}
        <div className="no-scrollbar mx-auto flex max-w-7xl gap-2.5 overflow-x-auto px-4 pt-12 pb-2 sm:px-6 lg:px-8">
          {PILL_ORDER.map((key) => {
            const isActive = filter === key;
            const label =
              key === "ALL" ? "Tümü" : categoryMeta[key].label;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "group flex shrink-0 items-center gap-2.5 overflow-hidden rounded-full border py-1.5 pl-1.5 pr-5 text-sm font-semibold transition",
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                    : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300"
                )}
              >
                <img
                  src={PILL_IMG[key]}
                  alt={label}
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Active campaigns ── */}
        <section
          id="firsatlar"
          className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={stagger}
          >
            <SectionHead
              icon={<Flame className="h-4 w-4 text-rose-500" />}
              eyebrow="Şu an aktif"
              title="Sayaç dolmadan kap"
              subtitle="Süresi en kısa olanlar üstte. Bir kere kaçırırsan o kampanya kapanır."
            />

            {active.length === 0 ? (
              <motion.div
                variants={fadeUp}
                className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white/50 p-12 text-center text-slate-400 backdrop-blur-sm"
              >
                Şu an aktif kampanya yok.
              </motion.div>
            ) : (
              <motion.div
                variants={stagger}
                className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {active.map((c) => (
                  <motion.div key={c.id} variants={fadeUp}>
                    <GlassCard campaign={c} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* ── Nearby map ── */}
        <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={stagger}
          >
            <SectionHead
              icon={<MapIcon className="h-4 w-4 text-blue-500" />}
              eyebrow="Yakınında"
              title="Listede gez, haritada gör"
              subtitle="İşletmeye dokun — pin parlasın. Pin'e dokun — kart vurgulansın."
            />
            <motion.div
              variants={fadeUp}
              className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm"
            >
              <NearbyPanel campaigns={campaigns} />
            </motion.div>
          </motion.div>
        </section>

        {/* ── Surprise banner (cinematic photo) ── */}
        <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
          >
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden rounded-3xl"
            >
              <div className="absolute inset-0">
                <Image
                  src={SURPRISE_IMG}
                  alt="Sürpriz paketler"
                  fill
                  sizes="(max-width: 1280px) 100vw, 1200px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />
              </div>
              <div className="relative z-10 flex flex-col gap-5 p-8 sm:p-12 lg:max-w-lg lg:p-16">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                  <Leaf className="h-3.5 w-3.5" />
                  Sıfır Atık
                </span>
                <h2 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
                  Gün sonu kalanları kurtar.
                  <br />
                  Cebine ve gezegene iyi gelsin.
                </h2>
                <p className="text-white/60">
                  İşletmelerin akşam kalan ürünlerini "Sürpriz Paket" olarak çok
                  daha ucuza al. İçinde ne çıkacağı sürpriz — ama keyfi de
                  orada.
                </p>
                <Link
                  href="/surpriz-paket"
                  className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-white/90 active:scale-[0.98]"
                >
                  Sürpriz paketleri gör
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Surprise packages grid ── */}
        {surprise.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.05 }}
              variants={stagger}
            >
              <SectionHead
                icon={<Leaf className="h-4 w-4 text-emerald-500" />}
                eyebrow="Sıfır atık"
                title="Bugünün sürpriz paketleri"
                subtitle="İçinde ne çıkacağı sürpriz — ama indirim her zaman büyük."
              />
              <motion.div
                variants={stagger}
                className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {surprise.map((c) => (
                  <motion.div key={c.id} variants={fadeUp}>
                    <GlassCard campaign={c} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </section>
        )}

        {/* Bottom padding */}
        <div className="h-28" />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   Section heading
   ═══════════════════════════════════════════════════════ */
function SectionHead({
  icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col gap-2">
      <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        {icon}
        {eyebrow}
      </div>
      <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      <p className="max-w-2xl text-slate-500">{subtitle}</p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Glass Campaign Card
   ═══════════════════════════════════════════════════════ */
function GlassCard({ campaign }: { campaign: MockCampaign }) {
  const cat = categoryMeta[campaign.business.category];
  const discount = Math.round(
    (1 - campaign.newPrice / campaign.oldPrice) * 100
  );
  const stockLow =
    campaign.remainingStock !== null &&
    campaign.totalStock !== null &&
    campaign.remainingStock / campaign.totalStock <= 0.25;
  const isSurprise = campaign.isSurprisePackage;

  return (
    <Link
      href={`/firsat/${campaign.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Photo header */}
      <div className="relative aspect-[5/3] w-full overflow-hidden">
        <Image
          src={campaign.imageUrl}
          alt={campaign.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />

        {/* Glass badge — top-left */}
        <div className="absolute left-3 top-3">
          {isSurprise ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
              <Gift className="h-3 w-3" />
              Sürpriz Paket
            </span>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm",
                discount >= 50 ? "bg-rose-500/80" : "bg-white/20"
              )}
            >
              {discount >= 50 && <Flame className="h-3 w-3" />}%{discount}{" "}
              indirim
            </span>
          )}
        </div>

        {/* Countdown — top-right */}
        <div className="absolute right-3 top-3">
          <CountdownTimer endsAt={campaign.endsAt.toISOString()} />
        </div>

        {/* Category chip — bottom-left */}
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
          <span>{cat.emoji}</span>
          {cat.label}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Business row */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <Image
              src={campaign.business.logoUrl}
              alt={campaign.business.name}
              width={24}
              height={24}
              className="h-6 w-6 shrink-0 rounded-full border border-slate-200 object-cover"
            />
            <span className="truncate font-semibold text-slate-800">
              {campaign.business.name}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <MapPin className="h-3 w-3" />
            {campaign.business.district}
          </div>
        </div>

        {/* Slogan */}
        <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-slate-800">
          {campaign.slogan}
        </p>

        {/* Price */}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              {isSurprise ? "Tahmini değer" : "Eski fiyat"}
            </div>
            <div className="text-sm text-slate-400 line-through">
              {formatPrice(campaign.oldPrice)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              Mavi Nokta fiyatı
            </div>
            <div className="text-2xl font-black leading-none text-blue-600">
              {formatPrice(campaign.newPrice)}
            </div>
          </div>
        </div>

        {/* Stock bar */}
        {campaign.remainingStock !== null && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-medium",
                  stockLow ? "text-rose-500" : "text-slate-500"
                )}
              >
                <ShoppingBag className="h-3 w-3" />
                {stockLow
                  ? `Son ${campaign.remainingStock} paket!`
                  : `${campaign.remainingStock} paket kaldı`}
              </span>
              {campaign.totalStock && (
                <span className="text-slate-400">
                  / {campaign.totalStock}
                </span>
              )}
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  stockLow ? "bg-rose-500" : "bg-blue-500"
                )}
                style={{
                  width: `${
                    campaign.totalStock
                      ? (campaign.remainingStock! / campaign.totalStock) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
