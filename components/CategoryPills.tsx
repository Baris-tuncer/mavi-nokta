"use client";

import { useState } from "react";
import { categoryMeta, type MockCategory } from "@/lib/mock-campaigns";
import { cn } from "@/lib/utils";

const ALL = "ALL" as const;
type Filter = typeof ALL | MockCategory;

const ORDER: Filter[] = [ALL, "CAFE", "RESTAURANT", "BAKERY", "MARKET", "PUB"];

export function CategoryPills() {
  const [active, setActive] = useState<Filter>(ALL);

  return (
    <div className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8">
      {ORDER.map((key) => {
        const isActive = active === key;
        const label = key === ALL ? "Tümü" : categoryMeta[key].label;
        const emoji = key === ALL ? null : categoryMeta[key].emoji;
        return (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition",
              isActive
                ? "border-mn-text bg-mn-text text-white"
                : "border-mn-border bg-mn-surface text-mn-text hover:border-mn-border-strong"
            )}
          >
            {emoji && <span>{emoji}</span>}
            {label}
          </button>
        );
      })}
    </div>
  );
}
