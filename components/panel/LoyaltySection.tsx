"use client";

import type { LoyaltyCardData } from "@/lib/mock-loyalty";
import { LoyaltyCard } from "./LoyaltyCard";

type Props = {
  card: LoyaltyCardData;
};

export function LoyaltySection({ card }: Props) {
  return (
    <section>
      <h2 className="text-lg font-bold text-slate-800">
        Sadakat Programi
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Musterileriniz her alisveriste damga kazanir
      </p>

      <div className="mt-4">
        <LoyaltyCard card={card} />
      </div>
    </section>
  );
}
