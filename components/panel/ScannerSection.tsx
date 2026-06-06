"use client";

import { useState } from "react";
import {
  ScanLine,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Zap,
  Users,
} from "lucide-react";
import type { ScannerData } from "@/lib/mock-scanner";
import { ScannerModal } from "./ScannerModal";

type Props = {
  data: ScannerData;
  isDemo: boolean;
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "az once";
  if (mins < 60) return `${mins}dk once`;
  const hours = Math.floor(mins / 60);
  return `${hours}sa once`;
}

const badgeIcons: Record<string, React.ReactNode> = {
  scan: <ScanLine className="h-3 w-3" />,
  users: <Users className="h-3 w-3" />,
};

export function ScannerSection({ data, isDemo }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const { gamification } = data;
  const xpPercent = (gamification.currentXP / gamification.nextLevelXP) * 100;

  return (
    <section>
      <h2 className="text-lg font-bold text-slate-800">
        Musteri Dogrulama
      </h2>

      {/* Today stat */}
      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm shadow-black/5">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50">
          <ScanLine className="h-5 w-5 text-blue-500" />
        </div>
        <div className="flex-1">
          <p className="text-2xl font-extrabold text-slate-900">
            {data.todayScans}
          </p>
          <p className="text-xs text-slate-400">Bugun tarama</p>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => setModalOpen(true)}
        className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 text-base font-bold text-white transition hover:bg-slate-800 active:scale-[0.98]"
      >
        <ScanLine className="h-5 w-5" />
        QR/PIN ile Dogrula
      </button>

      {/* Gamification */}
      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm shadow-black/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-bold text-slate-800">
              Seviye {gamification.level}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {gamification.currentXP}/{gamification.nextLevelXP} XP
          </span>
        </div>

        {/* XP Progress bar */}
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${Math.max(xpPercent, 2)}%` }}
          />
        </div>

        {/* Badges */}
        {gamification.badges.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {gamification.badges.map((badge) => (
              <span
                key={badge.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600"
              >
                {badgeIcons[badge.icon] ?? <Zap className="h-3 w-3" />}
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recent Scans */}
      <div className="mt-4 flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-500">
          Son Taramalar
        </h3>
        {data.recentScans.map((scan) => (
          <div
            key={scan.id}
            className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm shadow-black/5"
          >
            {scan.status === "SUCCESS" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-red-500" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700">
                {scan.customerName}
              </p>
              <p className="text-[11px] text-slate-400">
                {scan.campaignName}
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="h-3 w-3" />
              {timeAgo(scan.timestamp)}
            </span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <ScannerModal
          isDemo={isDemo}
          onClose={() => setModalOpen(false)}
        />
      )}
    </section>
  );
}
