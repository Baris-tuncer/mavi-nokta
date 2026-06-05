"use client";

import { useState, useTransition } from "react";
import { X, Sparkles, ChevronLeft } from "lucide-react";
import { createCampaign } from "@/app/_actions/campaign";
import { cn } from "@/lib/utils";

/* ── Template images from Unsplash ── */
const TEMPLATE_IMAGES = {
  STOK: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80&auto=format&fit=crop",
  SURPRIZ:
    "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&q=80&auto=format&fit=crop",
  HAPPY:
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80&auto=format&fit=crop",
  SERBEST:
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80&auto=format&fit=crop",
};

type TemplateKey = "STOK" | "SURPRIZ" | "HAPPY" | "SERBEST";

const TEMPLATES: {
  key: TemplateKey;
  title: string;
  subtitle: string;
  defaults: { isSurprise: boolean; duration: DurationKey };
}[] = [
  {
    key: "STOK",
    title: "Stok Eritme",
    subtitle: "İndirimli satış",
    defaults: { isSurprise: false, duration: "2h" },
  },
  {
    key: "SURPRIZ",
    title: "Sürpriz Paket",
    subtitle: "Sıfır Atık",
    defaults: { isSurprise: true, duration: "eod" },
  },
  {
    key: "HAPPY",
    title: "Mutlu Saat",
    subtitle: "Happy Hour",
    defaults: { isSurprise: false, duration: "2h" },
  },
  {
    key: "SERBEST",
    title: "Serbest",
    subtitle: "Kendin Yaz",
    defaults: { isSurprise: false, duration: "2h" },
  },
];

type DurationKey = "1h" | "2h" | "4h" | "eod";

const DURATIONS: { key: DurationKey; label: string }[] = [
  { key: "1h", label: "+1 Saat" },
  { key: "2h", label: "+2 Saat" },
  { key: "4h", label: "+4 Saat" },
  { key: "eod", label: "Gün Sonuna Kadar" },
];

function toLocalInput(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function calcTimes(key: DurationKey): { start: string; end: string } {
  const now = new Date();
  const startStr = toLocalInput(now);
  switch (key) {
    case "1h":
      return {
        start: startStr,
        end: toLocalInput(new Date(now.getTime() + 1 * 60 * 60_000)),
      };
    case "2h":
      return {
        start: startStr,
        end: toLocalInput(new Date(now.getTime() + 2 * 60 * 60_000)),
      };
    case "4h":
      return {
        start: startStr,
        end: toLocalInput(new Date(now.getTime() + 4 * 60 * 60_000)),
      };
    case "eod": {
      const eod = new Date(now);
      eod.setHours(23, 59, 0, 0);
      return { start: startStr, end: toLocalInput(eod) };
    }
  }
}

type Props = {
  isDemo: boolean;
  onClose: () => void;
};

export function QuickCampaignModal({ isDemo, onClose }: Props) {
  const [step, setStep] = useState<"template" | "form">("template");
  const [template, setTemplate] = useState<TemplateKey | null>(null);

  const [slogan, setSlogan] = useState("");
  const [isSurprise, setIsSurprise] = useState(false);
  const [oldPrice, setOldPrice] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [activeDuration, setActiveDuration] = useState<DurationKey | null>(
    "2h"
  );
  const [startsAt, setStartsAt] = useState(() => toLocalInput(new Date()));
  const [endsAt, setEndsAt] = useState(() => calcTimes("2h").end);
  const [totalStock, setTotalStock] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function applyDuration(key: DurationKey) {
    const times = calcTimes(key);
    setActiveDuration(key);
    setStartsAt(times.start);
    setEndsAt(times.end);
  }

  function selectTemplate(key: TemplateKey) {
    const t = TEMPLATES.find((t) => t.key === key)!;
    setTemplate(key);
    setIsSurprise(t.defaults.isSurprise);
    applyDuration(t.defaults.duration);
    setStep("form");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const op = parseFloat(oldPrice);
    const np = parseFloat(newPrice);

    if (!slogan.trim()) {
      setError("Slogan gerekli.");
      return;
    }
    if (isNaN(op) || isNaN(np) || op <= 0 || np <= 0) {
      setError("Geçerli fiyat girin.");
      return;
    }
    if (np >= op) {
      setError("İndirimli fiyat eski fiyattan düşük olmalı.");
      return;
    }
    if (!startsAt || !endsAt) {
      setError("Başlangıç ve bitiş saati gerekli.");
      return;
    }
    if (new Date(endsAt) <= new Date(startsAt)) {
      setError("Bitiş saati başlangıçtan sonra olmalı.");
      return;
    }
    if (isDemo) {
      alert("Demo modunda kampanya oluşturulamaz. Giriş yapın.");
      return;
    }

    const stock = totalStock.trim() ? parseInt(totalStock, 10) : null;

    start(async () => {
      const result = await createCampaign({
        slogan,
        title: slogan.slice(0, 60),
        description: null,
        imageUrl: null,
        oldPrice: op,
        newPrice: np,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        totalStock: stock,
        isSurprisePackage: isSurprise,
        surpriseHint: null,
        status: "ACTIVE",
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      onClose();
      window.location.reload();
    });
  }

  /* ── Input class ── */
  const inputCls =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — frosted glass */}
      <div className="relative w-full max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white/80 shadow-2xl shadow-black/10 backdrop-blur-xl sm:max-w-lg sm:rounded-3xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/70 px-5 py-4 backdrop-blur-xl">
          {step === "form" ? (
            <button
              onClick={() => setStep("template")}
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
              Geri
            </button>
          ) : (
            <h2 className="text-lg font-bold text-slate-800">
              Nasıl bir fırsat?
            </h2>
          )}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition hover:bg-slate-200"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5">
          {/* ─── Step 1: Templates with photos ─── */}
          {step === "template" && (
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => selectTemplate(t.key)}
                  className="group relative overflow-hidden rounded-2xl text-left transition active:scale-[0.97]"
                >
                  <img
                    src={TEMPLATE_IMAGES[t.key]}
                    alt={t.title}
                    className="h-36 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <span className="text-sm font-bold text-white">
                      {t.title}
                    </span>
                    <br />
                    <span className="text-xs text-white/60">
                      {t.subtitle}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ─── Step 2: Form ─── */}
          {step === "form" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Slogan */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Slogan
                </span>
                <input
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="Müşterinin kafasına yapışacak tek cümle"
                  className={inputCls}
                />
              </label>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Eski Fiyat (₺)
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    placeholder="100"
                    className={inputCls}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Mavi Nokta Fiyatı (₺)
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="50"
                    className={inputCls}
                  />
                </label>
              </div>

              {/* Duration buttons */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Hızlı Süre
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => applyDuration(d.key)}
                      className={cn(
                        "rounded-xl border py-2.5 text-center text-xs font-semibold transition",
                        activeDuration === d.key
                          ? "border-blue-300 bg-blue-50 text-blue-600"
                          : "border-slate-200 bg-white text-slate-500 hover:border-blue-200"
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start / End */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Başlangıç
                  </span>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => {
                      setStartsAt(e.target.value);
                      setActiveDuration(null);
                    }}
                    className={inputCls}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Bitiş
                  </span>
                  <input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => {
                      setEndsAt(e.target.value);
                      setActiveDuration(null);
                    }}
                    className={inputCls}
                  />
                </label>
              </div>

              {/* Stock */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Toplam Stok (opsiyonel)
                </span>
                <input
                  type="number"
                  step="1"
                  value={totalStock}
                  onChange={(e) => setTotalStock(e.target.value)}
                  placeholder="Limit yoksa boş bırak"
                  className={inputCls}
                />
              </label>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={pending}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 text-base font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 active:scale-[0.98]"
              >
                <Sparkles className="h-5 w-5" />
                {pending ? "Yayına alınıyor…" : "Yayına Al"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
