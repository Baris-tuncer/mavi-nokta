"use client";

import { Zap, ChevronRight } from "lucide-react";

type Props = {
  isPro: boolean;
  onUpgrade: () => void;
};

export function ProBanner({ isPro, onUpgrade }: Props) {
  if (isPro) return null;

  return (
    <button
      onClick={onUpgrade}
      className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-5 text-left transition active:scale-[0.99]"
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />

      <div className="relative flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-base font-bold text-white">
            Pro&apos;ya Gec
          </p>
          <p className="mt-0.5 text-sm text-white/70">
            Detayli analitik, oncelikli listeleme ve daha fazlasi
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-white/40 transition group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}
