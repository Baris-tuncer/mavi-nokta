"use client";

import type { LoyaltyCardData } from "@/lib/mock-loyalty";

type Props = {
  card: LoyaltyCardData;
};

export function LoyaltyCard({ card }: Props) {
  const remaining = card.totalStamps - card.collectedStamps;
  const isComplete = remaining <= 0;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 ${
        isComplete
          ? "bg-[#1D1D1F] ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10"
          : "bg-[#1D1D1F]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Sadakat Karti
          </p>
          <p className="mt-0.5 text-sm font-bold text-white">
            {card.businessName}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5 text-blue-400"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      </div>

      {/* Stamps Grid */}
      <div className="mt-5 flex flex-wrap gap-3">
        {Array.from({ length: card.totalStamps }, (_, i) => {
          const filled = i < card.collectedStamps;
          return (
            <div
              key={i}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                filled
                  ? "bg-blue-500 shadow-sm shadow-blue-500/30"
                  : "bg-white/10 border border-white/10"
              }`}
            >
              {filled && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 text-white"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-medium text-white/40">
          {card.collectedStamps} / {card.totalStamps}
        </span>
        {isComplete ? (
          <span className="text-xs font-bold text-blue-400">
            Odurunuz hazir!
          </span>
        ) : (
          <span className="text-xs font-medium text-white/60">
            {remaining} damga daha!
          </span>
        )}
      </div>

      {/* Reward */}
      <div className="mt-4 rounded-xl bg-white/5 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
          Odul
        </p>
        <p className="mt-0.5 text-sm font-semibold text-white/90">
          {card.reward}
        </p>
      </div>
    </div>
  );
}
