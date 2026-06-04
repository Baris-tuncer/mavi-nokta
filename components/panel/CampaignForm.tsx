"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Sparkles, Gift, Image as ImageIcon } from "lucide-react";
import { createCampaign } from "@/app/_actions/campaign";
import { cn } from "@/lib/utils";

function toLocalInput(d: Date): string {
  // datetime-local input formatı: YYYY-MM-DDTHH:MM
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function CampaignForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [isSurprise, setIsSurprise] = useState(false);
  const router = useRouter();

  const defaults = useMemo(() => {
    const now = new Date();
    const later = new Date(now.getTime() + 2 * 60 * 60_000); // +2 saat
    return { now: toLocalInput(now), later: toLocalInput(later) };
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    const oldPrice = parseFloat(String(fd.get("oldPrice") ?? ""));
    const newPrice = parseFloat(String(fd.get("newPrice") ?? ""));
    const totalStockRaw = String(fd.get("totalStock") ?? "").trim();
    const totalStock = totalStockRaw ? parseInt(totalStockRaw, 10) : null;

    const startsAt = new Date(String(fd.get("startsAt"))).toISOString();
    const endsAt = new Date(String(fd.get("endsAt"))).toISOString();

    const payload = {
      slogan: String(fd.get("slogan") ?? ""),
      title: String(fd.get("title") ?? ""),
      description: (String(fd.get("description") ?? "") || null) as string | null,
      imageUrl: (String(fd.get("imageUrl") ?? "") || null) as string | null,
      oldPrice,
      newPrice,
      startsAt,
      endsAt,
      totalStock,
      isSurprisePackage: isSurprise,
      surpriseHint:
        (isSurprise ? String(fd.get("surpriseHint") ?? "") : "") || null,
      status: "ACTIVE" as const,
    };

    start(async () => {
      const result = await createCampaign(payload);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/panel/isletme");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {/* Sürpriz toggle — formun en üstünde, çünkü hint kutusu buna bağlı */}
      <button
        type="button"
        onClick={() => setIsSurprise((v) => !v)}
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition",
          isSurprise
            ? "border-mn-eco/40 bg-mn-eco/10"
            : "border-mn-border bg-mn-surface hover:border-mn-border-strong"
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full",
              isSurprise ? "bg-mn-eco text-white" : "bg-mn-surface-2 text-mn-text-mute"
            )}
          >
            <Gift className="h-4 w-4" />
          </span>
          <div>
            <div className="text-sm font-semibold text-mn-text">
              Sıfır atık sürpriz paket
            </div>
            <div className="text-xs text-mn-text-soft">
              Gün sonu kalanları rastgele paketle, çok daha ucuza sat.
            </div>
          </div>
        </div>
        <div
          className={cn(
            "h-6 w-11 rounded-full transition",
            isSurprise ? "bg-mn-eco" : "bg-mn-border-strong"
          )}
        >
          <span
            className={cn(
              "block h-6 w-6 rounded-full bg-white shadow transition",
              isSurprise ? "translate-x-5" : "translate-x-0"
            )}
          />
        </div>
      </button>

      <Field
        label="Slogan"
        name="slogan"
        required
        placeholder="Bugün 14:00–16:00 arası filtre kahve yarı fiyatına"
        hint="Müşterinin kafasına hemen yapışacak tek cümle. ≤80 karakter ideal."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Ürün adı / başlık"
          name="title"
          required
          placeholder="Filtre Kahve"
        />
        <Field
          label="Fotoğraf URL (opsiyonel)"
          name="imageUrl"
          type="url"
          placeholder="https://..."
          icon={<ImageIcon className="h-4 w-4 text-mn-text-mute" />}
        />
      </div>

      <Field
        label="Açıklama (opsiyonel)"
        name="description"
        as="textarea"
        placeholder="Tek menşe Etiyopya çekirdekleri, taze kavrulmuş."
      />

      {isSurprise && (
        <Field
          label="Sürpriz ipucu"
          name="surpriseHint"
          placeholder="İçinde 3-5 adet pastacılık ürünü olur."
          hint="İçinde ne çıkacağı sürpriz, ama bir fikir vermek müşteriyi rahatlatır."
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Eski fiyat (₺)"
          name="oldPrice"
          type="number"
          step="0.01"
          required
          placeholder="100"
        />
        <Field
          label="Mavi Nokta fiyatı (₺)"
          name="newPrice"
          type="number"
          step="0.01"
          required
          placeholder="50"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Başlangıç"
          name="startsAt"
          type="datetime-local"
          required
          defaultValue={defaults.now}
        />
        <Field
          label="Bitiş"
          name="endsAt"
          type="datetime-local"
          required
          defaultValue={defaults.later}
          hint="Sayaç bu zamana göre işler — geri sayım kart üstünde görünür."
        />
      </div>

      <Field
        label="Toplam stok (opsiyonel)"
        name="totalStock"
        type="number"
        step="1"
        placeholder="50"
        hint="Limit yoksa boş bırak. Limit varsa müşteri 'son N kaldı' uyarısı görür."
      />

      {error && (
        <div className="rounded-lg border border-mn-magenta/30 bg-mn-magenta/10 px-3 py-2 text-sm text-mn-magenta">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-mn-border pt-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full px-5 py-2.5 text-sm font-medium text-mn-text-soft hover:text-mn-text"
        >
          Vazgeç
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-mn-text px-6 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" />
          {pending ? "Yayına alınıyor…" : "Yayına al"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
  hint,
  step,
  as,
  icon,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  hint?: string;
  step?: string;
  as?: "textarea";
  icon?: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-mn-text-mute">
        {label}
      </span>
      <div className="relative">
        {as === "textarea" ? (
          <textarea
            name={name}
            required={required}
            placeholder={placeholder}
            defaultValue={defaultValue}
            rows={3}
            className="w-full rounded-xl border border-mn-border bg-mn-surface px-3 py-2.5 text-sm text-mn-text outline-none transition focus:border-mn-blue focus:ring-2 focus:ring-mn-blue/20"
          />
        ) : (
          <input
            name={name}
            type={type}
            step={step}
            required={required}
            placeholder={placeholder}
            defaultValue={defaultValue}
            className={cn(
              "h-11 w-full rounded-xl border border-mn-border bg-mn-surface px-3 text-sm text-mn-text outline-none transition focus:border-mn-blue focus:ring-2 focus:ring-mn-blue/20",
              icon && "pl-9"
            )}
          />
        )}
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            {icon}
          </span>
        )}
      </div>
      {hint && <span className="text-xs text-mn-text-mute">{hint}</span>}
    </label>
  );
}
