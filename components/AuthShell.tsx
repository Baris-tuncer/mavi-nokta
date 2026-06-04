import Image from "next/image";
import Link from "next/link";

type Props = {
  side: "musteri" | "isletme";
  children: React.ReactNode;
};

const SIDE = {
  musteri: {
    eyebrow: "Müşteri",
    headline: "Şimdi, burada,\nyarı fiyatına.",
    body:
      "Mavi Nokta'da fırsatlar zamana karşı yarışır. Sayaç dolmadan kap, kasada QR kodunu göster — gerisini biz hallederiz.",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80&auto=format&fit=crop",
  },
  isletme: {
    eyebrow: "İşletme",
    headline: "Boş saatleri\ndolu masaya çevir.",
    body:
      "Sloganını yaz, fiyatını gir, sayacını başlat. Mahallendeki müşteriyi 5 dakikada içeri al — komisyonsuz, kayıt ücretsiz.",
    image:
      "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=1200&q=80&auto=format&fit=crop",
  },
} as const;

export function AuthShell({ side, children }: Props) {
  const s = SIDE[side];
  return (
    <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-2">
      {/* Sol: foto panel */}
      <div className="relative hidden lg:block">
        <Image
          src={s.image}
          alt=""
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium opacity-80 hover:opacity-100"
          >
            <span className="h-2 w-2 rounded-full bg-white" />
            Mavi Nokta
          </Link>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
            {s.eyebrow}
          </div>
          <h2 className="mt-3 max-w-md whitespace-pre-line text-4xl font-black leading-[1.05] tracking-tight">
            {s.headline}
          </h2>
          <p className="mt-3 max-w-md text-base text-white/85">{s.body}</p>
        </div>
      </div>

      {/* Sağ: form */}
      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
