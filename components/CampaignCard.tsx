import Link from "next/link";
import Image from "next/image";
import { Flame, Gift, MapPin, ShoppingBag } from "lucide-react";
import { categoryMeta, type MockCampaign } from "@/lib/mock-campaigns";
import { CountdownTimer } from "@/components/CountdownTimer";
import { cn, formatPrice } from "@/lib/utils";

export function CampaignCard({ campaign }: { campaign: MockCampaign }) {
  const cat = categoryMeta[campaign.business.category];
  const discount = Math.round(
    (1 - campaign.newPrice / campaign.oldPrice) * 100
  );
  const stockLow =
    campaign.remainingStock !== null &&
    campaign.totalStock !== null &&
    campaign.remainingStock / campaign.totalStock <= 0.25;

  const isSurprise = campaign.isSurprisePackage;

  return (
    <Link
      href={`/firsat/${campaign.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-mn-border bg-mn-surface transition duration-300 hover:-translate-y-0.5 hover:border-mn-border-strong hover:shadow-[0_18px_40px_-20px_rgba(15,23,41,0.25)]"
    >
      {/* HEADER — gerçek fotoğraf */}
      <div className="relative aspect-[5/3] w-full overflow-hidden bg-mn-surface-2">
        <Image
          src={campaign.imageUrl}
          alt={campaign.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        {/* Alttan yumuşak okunabilirlik gradient'i */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />

        {/* Sol üst: rozet */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {isSurprise ? (
            <Badge tone="eco" icon={<Gift className="h-3 w-3" />}>
              Sürpriz Paket
            </Badge>
          ) : (
            <Badge
              tone={discount >= 50 ? "fire" : "neutral"}
              icon={discount >= 50 ? <Flame className="h-3 w-3" /> : null}
            >
              %{discount} indirim
            </Badge>
          )}
        </div>

        {/* Sağ üst: countdown */}
        <div className="absolute right-3 top-3">
          <CountdownTimer endsAt={campaign.endsAt.toISOString()} />
        </div>

        {/* Sol alt: kategori chip */}
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-mn-text shadow-sm">
          <span>{cat.emoji}</span>
          {cat.label}
        </div>
      </div>

      {/* GÖVDE */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* İşletme satırı */}
        <div className="flex items-center justify-between gap-2 text-xs text-mn-text-mute">
          <div className="flex items-center gap-2 truncate">
            <Image
              src={campaign.business.logoUrl}
              alt={campaign.business.name}
              width={24}
              height={24}
              className="h-6 w-6 shrink-0 rounded-full border border-mn-border object-cover"
            />
            <span className="truncate font-semibold text-mn-text">
              {campaign.business.name}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-mn-text-soft">
            <MapPin className="h-3 w-3" />
            <span>{campaign.business.district}</span>
          </div>
        </div>

        {/* Slogan — kart kalbi */}
        <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-mn-text">
          {campaign.slogan}
        </p>

        {/* Fiyat bloğu */}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-mn-border pt-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-mn-text-mute">
              {isSurprise ? "Tahmini değer" : "Eski fiyat"}
            </div>
            <div className="text-sm text-mn-text-mute line-through">
              {formatPrice(campaign.oldPrice)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-mn-text-mute">
              Mavi Nokta fiyatı
            </div>
            <div className="text-2xl font-black leading-none text-mn-blue">
              {formatPrice(campaign.newPrice)}
            </div>
          </div>
        </div>

        {/* Stok */}
        {campaign.remainingStock !== null && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-medium",
                  stockLow ? "text-mn-magenta" : "text-mn-text-soft"
                )}
              >
                <ShoppingBag className="h-3 w-3" />
                {stockLow
                  ? `Son ${campaign.remainingStock} paket!`
                  : `${campaign.remainingStock} paket kaldı`}
              </span>
              {campaign.totalStock && (
                <span className="text-mn-text-mute">
                  / {campaign.totalStock}
                </span>
              )}
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-mn-surface-2">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  stockLow ? "bg-mn-magenta" : "bg-mn-blue"
                )}
                style={{
                  width: `${
                    campaign.totalStock
                      ? (campaign.remainingStock / campaign.totalStock) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

function Badge({
  children,
  icon,
  tone,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  tone: "fire" | "eco" | "neutral";
}) {
  const toneClass =
    tone === "fire"
      ? "bg-mn-magenta text-white"
      : tone === "eco"
      ? "bg-mn-eco text-white"
      : "bg-white/95 text-mn-text";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm",
        toneClass
      )}
    >
      {icon}
      {children}
    </span>
  );
}
