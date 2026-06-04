"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  variant: "musteri" | "isletme";
};

const COPY = {
  musteri: {
    title: "Müşteri Girişi",
    subtitle: "Mahallendeki anlık fırsatları yakalamaya devam et.",
    other: { href: "/giris/isletme", label: "İşletme misin?" },
    register: { href: "/kayit/musteri", label: "Hesabın yok mu? Kayıt ol" },
    redirectTo: "/",
  },
  isletme: {
    title: "İşletme Girişi",
    subtitle: "Kampanyalarını yönet, müşterini al.",
    other: { href: "/giris/musteri", label: "Müşteri misin?" },
    register: { href: "/kayit/isletme", label: "İşletme aç — ücretsiz" },
    redirectTo: "/panel/isletme",
  },
} as const;

export function LoginForm({ variant }: Props) {
  const copy = COPY[variant];
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").toLowerCase().trim();
    const password = String(fd.get("password") ?? "");

    start(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(
          error.message.toLowerCase().includes("invalid")
            ? "E-posta veya şifre hatalı."
            : error.message
        );
        return;
      }
      router.push(copy.redirectTo);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-mn-text">
          {copy.title}
        </h1>
        <p className="mt-1 text-sm text-mn-text-soft">{copy.subtitle}</p>
      </div>

      <Field
        label="E-posta"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <Field
        label="Şifre"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      {error && (
        <div className="rounded-lg border border-mn-magenta/30 bg-mn-magenta/10 px-3 py-2 text-sm text-mn-magenta">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-mn-text px-6 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-60"
      >
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>

      <div className="flex items-center justify-between pt-2 text-sm">
        <Link
          href={copy.register.href}
          className="font-semibold text-mn-blue hover:underline"
        >
          {copy.register.label}
        </Link>
        <Link
          href={copy.other.href}
          className="text-mn-text-soft hover:text-mn-text"
        >
          {copy.other.label}
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-mn-text-mute">
        {label}
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="h-11 rounded-xl border border-mn-border bg-mn-surface px-3 text-sm text-mn-text outline-none transition focus:border-mn-blue focus:ring-2 focus:ring-mn-blue/20"
      />
    </label>
  );
}
