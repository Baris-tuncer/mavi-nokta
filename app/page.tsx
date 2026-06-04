import { HeroSection } from "@/components/HeroSection";
import { CategoryPills } from "@/components/CategoryPills";
import { CampaignCard } from "@/components/CampaignCard";
import { SurpriseBanner } from "@/components/SurpriseBanner";
import { NearbyPanel } from "@/components/NearbyPanel";
import { mockCampaigns } from "@/lib/mock-campaigns";
import { getActiveCampaignsForHomepage } from "@/lib/queries/campaigns";
import { Flame, Leaf, Map as MapIcon } from "lucide-react";

export default async function Home() {
  // Önce gerçek DB'den çek; boşsa mock göster (yeni proje hissi yerine canlı landing)
  let real: Awaited<ReturnType<typeof getActiveCampaignsForHomepage>> = [];
  try {
    real = await getActiveCampaignsForHomepage();
  } catch (e) {
    console.error("[home query]", e);
  }

  // Gerçek kampanyalar üstte, demo'lar altta — birlikte göster ki landing zengin kalsın
  const campaigns = [...real, ...mockCampaigns];

  const active = [...campaigns]
    .filter((c) => !c.isSurprisePackage)
    .sort((a, b) => a.endsAt.getTime() - b.endsAt.getTime());

  const surprise = campaigns.filter((c) => c.isSurprisePackage);

  return (
    <div className="flex flex-col gap-16 pb-24">
      <HeroSection />

      {!usingReal && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-mn-amber/30 bg-mn-amber/10 px-4 py-3 text-sm text-mn-text">
            <strong className="text-mn-amber">Demo modu:</strong> şu an
            önyüklenmiş örnek kampanyalar gösteriliyor. Bir işletme
            kampanya yayına alır almaz buraya gerçek veriler gelir.
          </div>
        </div>
      )}

      <div className="space-y-6">
        <CategoryPills />

        <section
          id="firsatlar"
          className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <SectionHeading
            icon={<Flame className="h-4 w-4 text-mn-magenta" />}
            eyebrow="Şu an aktif"
            title="Sayaç dolmadan kap"
            subtitle="Süresi en kısa olanlar üstte. Bir kere kaçırırsan o kampanya kapanır."
          />

          {active.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-mn-border bg-mn-surface/50 p-10 text-center text-mn-text-soft">
              Şu an aktif kampanya yok.
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {active.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* HARİTA — sadece gerçek data varsa NearbyPanel'i göster, mock'la zorlamayalım */}
      {usingReal && (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            icon={<MapIcon className="h-4 w-4 text-mn-blue" />}
            eyebrow="Yakınında"
            title="Listede gez, haritada gör"
            subtitle="İşletmeye dokun — pin parlasın. Pin'e dokun — kart vurgulansın."
          />
          <div className="mt-8">
            <NearbyPanel campaigns={campaigns} />
          </div>
        </section>
      )}

      {/* Mock modunda da harita anlamlı çünkü 8 mock işletme var */}
      {!usingReal && (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            icon={<MapIcon className="h-4 w-4 text-mn-blue" />}
            eyebrow="Yakınında"
            title="Listede gez, haritada gör"
            subtitle="İşletmeye dokun — pin parlasın. Pin'e dokun — kart vurgulansın."
          />
          <div className="mt-8">
            <NearbyPanel campaigns={campaigns} />
          </div>
        </section>
      )}

      <section className="px-4 sm:px-6 lg:px-8">
        <SurpriseBanner />
      </section>

      {surprise.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            icon={<Leaf className="h-4 w-4 text-mn-eco" />}
            eyebrow="Sıfır atık"
            title="Bugünün sürpriz paketleri"
            subtitle="İçinde ne çıkacağı sürpriz — ama indirim her zaman büyük."
          />
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {surprise.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeading({
  icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-mn-text-mute">
        {icon}
        {eyebrow}
      </div>
      <h2 className="text-3xl font-black tracking-tight text-mn-text sm:text-4xl">
        {title}
      </h2>
      <p className="max-w-2xl text-mn-text-soft">{subtitle}</p>
    </div>
  );
}
