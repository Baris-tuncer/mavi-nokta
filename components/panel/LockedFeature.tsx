"use client";

import { Lock, Zap } from "lucide-react";

type Props = {
  isPro: boolean;
  label: string;
  onUpgrade: () => void;
  children: React.ReactNode;
};

export function LockedFeature({ isPro, label, onUpgrade, children }: Props) {
  if (isPro) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="pointer-events-none select-none blur-[6px] opacity-60">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/40 backdrop-blur-[2px]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <Lock className="h-5 w-5 text-slate-400" />
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          {label}
        </p>
        <button
          onClick={onUpgrade}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-600 active:scale-[0.98]"
        >
          <Zap className="h-3 w-3" />
          Pro ile ac
        </button>
      </div>
    </div>
  );
}
