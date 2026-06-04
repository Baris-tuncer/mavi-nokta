"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  endsAt: string; // ISO — server'dan string olarak gelmeli ki hydration tutarlı olsun
  variant?: "card" | "large";
};

function diff(endsAt: number) {
  const ms = Math.max(0, endsAt - Date.now());
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { ms, h, m, s, totalSec };
}

export function CountdownTimer({ endsAt, variant = "card" }: Props) {
  const target = new Date(endsAt).getTime();
  const [mounted, setMounted] = useState(false);
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    setMounted(true);
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const expired = mounted && t.ms === 0;
  const urgent = mounted && !expired && t.totalSec <= 30 * 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (variant === "large") {
    return (
      <div className="flex items-center gap-2">
        <TimeBlock value={t.h} label="sa" highlight={urgent} />
        <Sep />
        <TimeBlock value={t.m} label="dk" highlight={urgent} />
        <Sep />
        <TimeBlock value={t.s} label="sn" highlight={urgent} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums backdrop-blur",
        expired
          ? "bg-mn-surface-2 text-mn-text-mute"
          : urgent
          ? "bg-mn-magenta text-white"
          : "bg-white/95 text-mn-text shadow-sm"
      )}
    >
      <Timer className="h-3.5 w-3.5" />
      {!mounted ? (
        <span suppressHydrationWarning>—:—</span>
      ) : expired ? (
        <span>Süre doldu</span>
      ) : t.h > 0 ? (
        <span>
          {t.h}sa {pad(t.m)}dk {pad(t.s)}sn
        </span>
      ) : (
        <span>
          {pad(t.m)}:{pad(t.s)}
        </span>
      )}
    </div>
  );
}

function TimeBlock({
  value,
  label,
  highlight,
}: {
  value: number;
  label: string;
  highlight: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-[3rem] flex-col items-center rounded-xl border px-2 py-1.5",
        highlight
          ? "border-mn-magenta/30 bg-mn-magenta/10 text-mn-magenta"
          : "border-mn-border bg-mn-surface text-mn-text"
      )}
    >
      <span className="text-2xl font-black tabular-nums leading-none">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-wider text-mn-text-mute">
        {label}
      </span>
    </div>
  );
}

function Sep() {
  return <span className="text-lg font-black text-mn-text-mute">:</span>;
}
