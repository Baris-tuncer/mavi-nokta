"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cities } from "@/lib/mock-campaigns";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createBusiness } from "@/app/_actions/business";
import type { BusinessCategory } from "@/lib/database.types";

const CATEGORIES: { value: BusinessCategory; label: string }[] = [
  { value: "CAFE", label: "Cafe" },
  { value: "RESTAURANT", label: "Restoran" },
  { value: "BAKERY", label: "Fırın" },
  { value: "MARKET", label: "Market" },
  { value: "PUB", label: "Pub" },
  { value: "OTHER", label: "Diğer" },
];

const CITY_CENTER: Record<string, [number, number]> = {
  istanbul: [41.0082, 28.9784],
  ankara: [39.9334, 32.8597],
  izmir: [38.4192, 27.1287],
  bursa: [40.1828, 29.0665],
  antalya: [36.8969, 30.7133],
};

export function RegisterBusinessForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [cityKey, setCityKey] = useState<keyof typeof CITY_CENTER>(
    cities[0].key as keyof typeof CITY_CENTER
  );
  const router = useRouter();

  const cityRow = cities.find((c) => c.key === cityKey) ?? cities[0];

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").toLowerCase().trim();
    const password = String(fd.get("password") ?? "");
    const ownerName = String(fd.get("ownerName") ?? "");
    const businessName = String(fd.get("businessName") ?? "");
    const category = String(fd.get("category") ?? "") as BusinessCategory;
    const district = String(fd.get("district") ?? "");
    const address = String(fd.get("address") ?? "");
    const phone = String(fd.get("phone") ?? "") || null;

    start(async () => {
      try {
        const supabase = createSupabaseBrowserClient();

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: ownerName, role: "BUSINESS" },
          },
        });

        if (signUpError) {
          console.error("[business signUp]", signUpError);
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
          // Email confirmation açıksa session gelmez — kullanıcı maile bakacak
          router.push("/giris/isletme?yeni=1");
          return;
        }

        // Trigger profile satırını oluşturmuş olmalı; küçük bir bekleme race condition'ı önler
        await new Promise((r) => setTimeout(r, 200));

        const result = await createBusiness({
          businessName,
          category,
          cityKey,
          cityLabel: cityRow.label,
          district,
          address,
          phone,
        });

        if ("error" in result) {
          console.error("[createBusiness]", result.error);
          setError(`İşletme kaydı atılamadı: ${result.error}`);
          return;
        }

        window.location.href = "/panel/isletme";
      } catch (e) {
        console.error("[business form unexpected]", e);
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
          İşletmeni Kaydet
        </h1>
        <p className="mt-1 text-sm text-mn-text-soft">
          Ücretsiz · Komisyonsuz · Aboneliksiz.
        </p>
      </div>

      <Field label="Yetkili Ad Soyad" name="ownerName" required />
      <Field label="E-posta" name="email" type="email" autoComplete="email" required />
      <Field
        label="Şifre"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="En az 6 karakter."
      />

      <hr className="my-2 border-mn-border" />

      <Field label="İşletme Adı" name="businessName" required />

      <Select label="Kategori" name="category" required>
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Şehir"
          name="cityKey"
          value={cityKey}
          onChange={(e) =>
            setCityKey(e.target.value as keyof typeof CITY_CENTER)
          }
          required
        >
          {cities.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </Select>
        <Select label="İlçe" name="district" required>
          {cityRow.districts
            .filter((d) => d !== "Tüm ilçeler")
            .map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
        </Select>
      </div>

      <Field label="Açık Adres" name="address" required placeholder="Mahalle, sokak, no" />
      <Field label="Telefon (opsiyonel)" name="phone" type="tel" autoComplete="tel" />

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
        {pending ? "Kayıt oluşturuluyor…" : "İşletme aç"}
      </button>

      <Link
        href="/giris/isletme"
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

function Select({
  label,
  name,
  required,
  value,
  onChange,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-mn-text-mute">
        {label}
      </span>
      <select
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        className="h-11 rounded-xl border border-mn-border bg-mn-surface px-3 text-sm text-mn-text outline-none transition focus:border-mn-blue focus:ring-2 focus:ring-mn-blue/20"
      >
        {children}
      </select>
    </label>
  );
}
