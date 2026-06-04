import Link from "next/link";
import Image from "next/image";
import { Sparkles, Leaf, Timer } from "lucide-react";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:px-8">
      <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-mn-border bg-mn-surface px-3 py-1 text-xs font-medium text-mn-text-soft">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mn-magenta/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mn-magenta" />
            </span>
            İstanbul'da şu an <strong className="text-mn-text">324</strong> aktif
            fırsat
          </span>

          <h1 className="mt-5 text-balance text-5xl font-black leading-[1.05] tracking-tight text-mn-text sm:text-6xl">
            Mahallendeki anlık fırsatlar,
            <br />
            <span className="text-mn-blue">tek noktada.</span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg text-mn-text-soft">
            Cafe, restoran, fırın ve marketlerin{" "}
            <span className="font-semibold text-mn-text">zaman duyarlı</span>{" "}
            kampanyaları. Sayaç dolmadan kap — kalan sürpriz paketleri kurtar.
          </p>

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link
              href="#firsatlar"
              className="inline-flex items-center gap-2 rounded-full bg-mn-text px-6 py-3 text-base font-semibold text-white transition hover:bg-black"
            >
              <Sparkles className="h-4 w-4" />
              Aktif fırsatları gör
            </Link>
            <Link
              href="/giris/isletme"
              className="inline-flex items-center gap-2 rounded-full border border-mn-border-strong bg-mn-surface px-6 py-3 text-base font-semibold text-mn-text transition hover:border-mn-text"
            >
              İşletme misin? Ücretsiz başla
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm">
            <Stat
              icon={<Timer className="h-4 w-4 text-mn-blue" />}
              value="≤ 2 saat"
              label="ortalama fırsat süresi"
            />
            <Stat
              icon={<Leaf className="h-4 w-4 text-mn-eco" />}
              value="2.4 ton"
              label="bu ay kurtarılan yemek"
            />
            <Stat
              icon={<Sparkles className="h-4 w-4 text-mn-magenta" />}
              value="%63"
              label="ortalama indirim"
            />
          </div>
        </div>

        {/* Sağ: gerçek fotoğraf kolajı */}
        <div className="relative hidden lg:block">
          <div className="relative grid h-full grid-cols-2 grid-rows-3 gap-3">
            <PhotoTile
              className="row-span-2"
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop"
              alt="Filtre kahve"
            />
            <PhotoTile
              src="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&q=80&auto=format&fit=crop"
              alt="Pasta tabağı"
            />
            <PhotoTile
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&auto=format&fit=crop"
              alt="Taze ekmek"
            />
            <PhotoTile
              className="col-span-2"
              src="https://images.unsplash.com/photo-1568644396922-5c3bfae12521?w=900&q=80&auto=format&fit=crop"
              alt="Bira ve atmosfer"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function PhotoTile({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-mn-border bg-mn-surface-2 ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 40vw"
        className="object-cover"
      />
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <div className="text-base font-bold text-mn-text">{value}</div>
        <div className="text-xs text-mn-text-mute">{label}</div>
      </div>
    </div>
  );
}
