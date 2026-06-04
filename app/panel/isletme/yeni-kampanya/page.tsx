import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCurrentProfile } from "@/app/_actions/profile";
import { CampaignForm } from "@/components/panel/CampaignForm";

export default async function NewCampaignPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/giris/isletme");
  if (profile.role !== "BUSINESS") redirect("/");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/panel/isletme"
        className="inline-flex items-center gap-1 text-sm font-medium text-mn-text-soft transition hover:text-mn-text"
      >
        <ChevronLeft className="h-4 w-4" />
        Panele dön
      </Link>

      <div className="mt-4">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-mn-text-mute">
          Yeni kampanya
        </div>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-mn-text sm:text-4xl">
          Sloganını yaz, sayacı başlat.
        </h1>
        <p className="mt-2 max-w-xl text-mn-text-soft">
          Müşterilerin görür görmez içinde "şimdi gideyim" hissi uyandırsın.
          Kısa ve net.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-mn-border bg-mn-surface p-6 sm:p-8">
        <CampaignForm />
      </div>
    </div>
  );
}
