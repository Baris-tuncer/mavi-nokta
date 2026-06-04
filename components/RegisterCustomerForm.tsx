"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  ensureCustomerRow,
  updateProfileExtras,
} from "@/app/_actions/profile";

export function RegisterCustomerForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").toLowerCase().trim();
    const password = String(fd.get("password") ?? "");
    const fullName = String(fd.get("name") ?? "");
    const phone = String(fd.get("phone") ?? "") || null;
    const city = String(fd.get("city") ?? "") || null;

    start(async () => {
      try {
        const supabase = createSupabaseBrowserClient();

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role: "CUSTOMER" },
          },
        });

        if (signUpError) {
          console.error("[customer signUp]", signUpError);
          setError(
            `Kayıt hatası: ${signUpError.message || "boş mesaj"} (status: ${
              signUpError.status ?? "?"
            }, code: ${signUpError.code ?? "?"})`
          );
          return;
        }

        if (!data.user) {
          setError("Hesap kaydı bilinmeyen bir nedenle tamamlanamadı.");
          return;
        }

        if (!data.session) {
          // Email confirmation açıksa
          router.push("/giris/musteri?yeni=1");
          return;
        }

        // profiles row trigger ile oluştu — küçük bekleme race önler
        await new Promise((r) => setTimeout(r, 200));

        if (phone || city) {
          await updateProfileExtras({ phone, city });
        }
        await ensureCustomerRow();

        window.location.href = "/";
      } catch (e) {
        console.error("[customer form unexpected]", e);
        setError(
          `Beklenmeyen hata: ${
            e instanceof Error ? e.message : String(e)
          } — konsoldaki detayı bana yapıştır.`
        );
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-mn-text">
          Müşteri Hesabı Oluştur
        </h1>
        <p className="mt-1 text-sm text-mn-text-soft">
          30 saniye sürer. Kart yok, abonelik yok.
        </p>
      </div>

      <Field label="Ad Soyad" name="name" required />
      <Field label="E-posta" name="email" type="email" autoComplete="email" required />
      <Field
        label="Şifre"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="En az 6 karakter."
      />
      <Field label="Telefon (opsiyonel)" name="phone" type="tel" autoComplete="tel" />
      <Field label="Şehir (opsiyonel)" name="city" placeholder="İstanbul" />

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
        {pending ? "Kayıt oluşturuluyor…" : "Hesap aç"}
      </button>

      <Link
        href="/giris/musteri"
        className="text-center text-sm text-mn-text-soft hover:text-mn-text"
      >
        Zaten hesabın var mı? Giriş yap
      </Link>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-mn-text-mute">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="h-11 rounded-xl border border-mn-border bg-mn-surface px-3 text-sm text-mn-text outline-none transition focus:border-mn-blue focus:ring-2 focus:ring-mn-blue/20"
      />
      {hint && <span className="text-xs text-mn-text-mute">{hint}</span>}
    </label>
  );
}
