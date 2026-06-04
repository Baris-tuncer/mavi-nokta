"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { categoryMeta } from "@/lib/mock-campaigns";
import {
  cheapestCampaign,
  type BusinessGroup,
} from "@/lib/business-groups";
import { formatPrice } from "@/lib/utils";

const defaultIcon = L.divIcon({
  className: "mn-pin",
  html: '<div class="mn-pin-dot"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -10],
});

const activeIcon = L.divIcon({
  className: "mn-pin",
  html: '<div class="mn-pin-dot mn-pin-active"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
});

function FitBounds({ groups }: { groups: BusinessGroup[] }) {
  const map = useMap();
  useEffect(() => {
    if (!groups.length) return;
    const bounds = L.latLngBounds(
      groups.map((g) => [g.lat, g.lng] as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [groups, map]);
  return null;
}

type Props = {
  groups: BusinessGroup[];
  activeId: string | null;
  onActiveChange: (id: string | null) => void;
};

export function LeafletMap({ groups, activeId, onActiveChange }: Props) {
  return (
    <div className="h-full overflow-hidden rounded-2xl border border-mn-border bg-mn-surface">
      <MapContainer
        center={[41.0082, 28.9784]}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds groups={groups} />
        {groups.map((g) => {
          const isActive = activeId === g.key;
          const cat = categoryMeta[g.category];
          const cheap = cheapestCampaign(g);
          return (
            <Marker
              key={g.key}
              position={[g.lat, g.lng]}
              icon={isActive ? activeIcon : defaultIcon}
              zIndexOffset={isActive ? 1000 : 0}
              eventHandlers={{
                click: () => onActiveChange(g.key),
              }}
            >
              <Popup>
                <div className="min-w-[220px]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-mn-text-mute">
                    {cat.emoji} {cat.label} · {g.district}
                  </div>
                  <div className="mt-1 text-base font-bold text-mn-text">
                    {g.name}
                  </div>
                  <div className="mt-3 border-t border-mn-border pt-3 text-sm">
                    <div className="text-mn-text">{cheap.slogan}</div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-xs text-mn-text-mute line-through">
                        {formatPrice(cheap.oldPrice)}
                      </span>
                      <span className="text-lg font-black text-mn-blue">
                        {formatPrice(cheap.newPrice)}
                      </span>
                    </div>
                    <a
                      href={`/firsat/${cheap.slug}`}
                      className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-mn-text px-3 py-2 text-xs font-semibold text-white no-underline"
                    >
                      Fırsata git
                    </a>
                  </div>
                  {g.campaigns.length > 1 && (
                    <div className="mt-2 text-[11px] text-mn-text-mute">
                      Bu işletmede {g.campaigns.length} aktif fırsat
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
