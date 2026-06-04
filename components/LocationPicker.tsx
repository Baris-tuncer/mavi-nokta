"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin, Check } from "lucide-react";
import { cities, type CityKey } from "@/lib/mock-campaigns";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "mn-location";

type Selection = { city: CityKey; district: string };

const DEFAULT: Selection = { city: "istanbul", district: "Tüm ilçeler" };

export function LocationPicker() {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<Selection>(DEFAULT);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSel(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sel));
    } catch {}
  }, [sel, mounted]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const city = cities.find((c) => c.key === sel.city) ?? cities[0];

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-mn-border bg-mn-surface px-3.5 text-sm font-medium text-mn-text transition hover:border-mn-border-strong"
      >
        <MapPin className="h-4 w-4 text-mn-blue" />
        <span className="font-semibold">{city.label}</span>
        <span className="text-mn-text-mute">·</span>
        <span className="text-mn-text-soft">{sel.district}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-mn-text-mute transition",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 grid w-[420px] grid-cols-[160px_1fr] overflow-hidden rounded-2xl border border-mn-border bg-mn-surface shadow-[0_24px_60px_-20px_rgba(15,23,41,0.25)]">
          {/* Şehirler */}
          <div className="max-h-72 overflow-y-auto border-r border-mn-border bg-mn-surface-2/40">
            {cities.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() =>
                  setSel({ city: c.key, district: c.districts[0] })
                }
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition",
                  c.key === sel.city
                    ? "bg-mn-blue-soft font-semibold text-mn-blue"
                    : "text-mn-text hover:bg-mn-surface-2"
                )}
              >
                {c.label}
                {c.key === sel.city && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
          {/* İlçeler */}
          <div className="max-h-72 overflow-y-auto">
            {city.districts.map((d) => {
              const active = d === sel.district;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setSel((p) => ({ ...p, district: d }));
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition",
                    active
                      ? "font-semibold text-mn-blue"
                      : "text-mn-text hover:bg-mn-surface-2"
                  )}
                >
                  {d}
                  {active && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
