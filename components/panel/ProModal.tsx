"use client";

import { X, Check, Minus, Zap } from "lucide-react";
import { demoPlans } from "@/lib/mock-subscription";

type Props = {
  isPro: boolean;
  isDemo: boolean;
  onClose: () => void;
};

export function ProModal({ isPro, isDemo, onClose }: Props) {
  const { free, pro } = demoPlans;

  function handleSubscribe() {
    if (isDemo) {
      alert("Demo modunda abonelik islemleri kullanilamaz. Giris yapin.");
      return;
    }
    // TODO: gercek odeme akisi
    alert("Abonelik sistemi yakinda aktif olacak!");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white/80 shadow-2xl shadow-black/10 backdrop-blur-xl sm:max-w-lg sm:rounded-3xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/70 px-5 py-4 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-slate-800">Plan Secin</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition hover:bg-slate-200"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5">
          {/* Plan Comparison */}
          <div className="grid grid-cols-2 gap-3">
            {/* Free Plan */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-base font-bold text-slate-800">
                {free.name}
              </h3>
              <div className="mt-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  ₺{free.price}
                </span>
                <span className="text-sm text-slate-400">/{free.period}</span>
              </div>

              <div className="mt-4 flex flex-col gap-2.5">
                {free.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {f.free === true ? (
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    ) : f.free === false ? (
                      <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
                    ) : (
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    )}
                    <span className="text-xs text-slate-500">
                      {typeof f.free === "string" ? f.free : f.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-4">
                {isPro ? (
                  <div className="h-12 flex items-center justify-center rounded-xl bg-slate-50 text-sm font-semibold text-slate-400">
                    Free
                  </div>
                ) : (
                  <div className="h-12 flex items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-500">
                    Mevcut
                  </div>
                )}
              </div>
            </div>

            {/* Pro Plan */}
            <div className="flex flex-col rounded-2xl border-2 border-blue-200 bg-white p-4 ring-1 ring-blue-100">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-slate-800">
                  {pro.name}
                </h3>
                <Zap className="h-4 w-4 text-blue-500" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-extrabold text-blue-600">
                  ₺{pro.price}
                </span>
                <span className="text-sm text-slate-400">/{pro.period}</span>
              </div>

              <div className="mt-4 flex flex-col gap-2.5">
                {pro.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <span className="text-xs font-medium text-slate-700">
                      {typeof f.pro === "string" ? f.pro : f.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-4">
                {isPro ? (
                  <div className="h-12 flex items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-blue-500">
                    Mevcut
                  </div>
                ) : (
                  <button
                    onClick={handleSubscribe}
                    className="flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-blue-500 text-sm font-bold text-white transition hover:bg-blue-600 active:scale-[0.98]"
                  >
                    <Zap className="h-4 w-4" />
                    Basla
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Trial info */}
          {!isPro && (
            <p className="mt-4 text-center text-xs text-slate-400">
              {pro.trialDays} gun ucretsiz deneme — istediginiz zaman iptal edin
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
