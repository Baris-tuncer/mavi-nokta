"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, LayoutDashboard, Ticket } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  email: string;
  role: "CUSTOMER" | "BUSINESS";
};

export function UserMenu({ name, email, role }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

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

  const initials = (name || email)
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const panelHref = role === "BUSINESS" ? "/panel/isletme" : "/panel/musteri";
  const panelLabel = role === "BUSINESS" ? "İşletme paneli" : "Hesabım";

  async function handleSignOut() {
    setOpen(false);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[signOut]", error);
      alert(`Çıkış yapılamadı: ${error.message}`);
      return;
    }
    // Hard reload — server-rendered Header'ın yeni session state ile gelmesi şart
    window.location.href = "/";
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-mn-border bg-mn-surface pl-1 pr-2.5 text-sm font-medium text-mn-text transition hover:border-mn-border-strong"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mn-blue text-xs font-bold text-white">
          {initials || "•"}
        </span>
        <span className="hidden text-sm font-semibold sm:inline">{name}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-mn-text-mute transition",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-mn-border bg-mn-surface shadow-[0_24px_60px_-20px_rgba(15,23,41,0.25)]">
          <div className="border-b border-mn-border px-4 py-3">
            <div className="text-sm font-semibold text-mn-text">{name}</div>
            <div className="truncate text-xs text-mn-text-mute">{email}</div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-mn-blue-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mn-blue">
              {role === "BUSINESS" ? "İşletme" : "Müşteri"}
            </div>
          </div>
          <Link
            href={panelHref}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-mn-text transition hover:bg-mn-surface-2"
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard className="h-4 w-4" />
            {panelLabel}
          </Link>
          {role === "CUSTOMER" && (
            <Link
              href="/firsatlarim"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-mn-text transition hover:bg-mn-surface-2"
              onClick={() => setOpen(false)}
            >
              <Ticket className="h-4 w-4" />
              Fırsatlarım
            </Link>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 border-t border-mn-border px-4 py-2.5 text-left text-sm text-mn-magenta transition hover:bg-mn-magenta/5"
          >
            <LogOut className="h-4 w-4" />
            Çıkış yap
          </button>
        </div>
      )}
    </div>
  );
}
