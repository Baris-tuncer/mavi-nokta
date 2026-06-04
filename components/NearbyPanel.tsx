"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { categoryMeta, type MockCampaign } from "@/lib/mock-campaigns";
import {
  cheapestCampaign,
  groupCampaignsByBusiness,
  type BusinessGroup,
} from "@/lib/business-groups";
import { cn, formatPrice } from "@/lib/utils";

const LeafletMap = dynamic(
  () => import("./LeafletMap").then((m) => m.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-2xl border border-mn-border bg-mn-surface-2 text-sm text-mn-text-mute">
        Harita yükleniyor…
      </div>
    ),
  }
);

export function NearbyPanel({ campaigns }: { campaigns: MockCampaign[] }) {
  const groups = useMemo(
    () => groupCampaignsByBusiness(campaigns),
    [campaigns]
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
      {/* Sol: kaydırılabilir işletme listesi */}
      <div className="flex h-[520px] flex-col overflow-y-auto rounded-2xl border border-mn-border bg-mn-surface">
        {groups.map((g) => (
          <BusinessRow
            key={g.key}
            group={g}
            active={activeId === g.key}
            onHover={() => setActiveId(g.key)}
            onLeave={() =>
              setActiveId((curr) => (curr === g.key ? null : curr))
            }
          />
        ))}
      </div>

      {/* Sağ: harita */}
      <div className="h-[520px]">
        <LeafletMap
          groups={groups}
          activeId={activeId}
          onActiveChange={setActiveId}
        />
      </div>
    </div>
  );
}

function BusinessRow({
  group,
  active,
  onHover,
  onLeave,
}: {
  group: BusinessGroup;
  active: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const cat = categoryMeta[group.category];
  const cheap = cheapestCampaign(group);
  const discount = Math.round((1 - cheap.newPrice / cheap.oldPrice) * 100);

  return (
    <Link
      href={`/firsat/${cheap.slug}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cn(
        "flex gap-3 border-b border-mn-border p-3 transition last:border-b-0",
        active
          ? "bg-mn-blue-soft/60"
          : "hover:bg-mn-surface-2"
      )}
    >
      <Image
        src={group.logoUrl}
        alt={group.name}
        width={64}
        height={64}
        className="h-16 w-16 shrink-0 rounded-xl border border-mn-border object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-mn-text">
              {group.name}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-mn-text-soft">
              <span>
                {cat.emoji} {cat.label}
              </span>
              <span className="text-mn-text-mute">·</span>
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {group.district}
              </span>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-mn-magenta/10 px-2 py-0.5 text-[10px] font-bold text-mn-magenta">
            %{discount}
          </span>
        </div>
        <div className="mt-1.5 line-clamp-1 text-xs text-mn-text-soft">
          {cheap.slogan}
        </div>
        <div className="mt-1.5 flex items-baseline justify-between gap-2">
          <div className="text-xs text-mn-text-mute line-through">
            {formatPrice(cheap.oldPrice)}
          </div>
          <div className="text-base font-black text-mn-blue">
            {formatPrice(cheap.newPrice)}
          </div>
        </div>
        {group.campaigns.length > 1 && (
          <div className="mt-1 text-[10px] uppercase tracking-wider text-mn-text-mute">
            +{group.campaigns.length - 1} fırsat daha
          </div>
        )}
      </div>
    </Link>
  );
}
