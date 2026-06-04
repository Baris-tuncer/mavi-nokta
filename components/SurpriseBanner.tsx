import Image from "next/image";
import Link from "next/link";
import { Leaf, ArrowRight } from "lucide-react";

export function SurpriseBanner() {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 overflow-hidden rounded-2xl border border-mn-border bg-mn-surface lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-mn-eco/30 bg-mn-eco/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-mn-eco">
          <Leaf className="h-3.5 w-3.5" />
          Sıfır Atık
        </span>
        <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-mn-text sm:text-4xl">
          Gün sonu kalanları kurtar.
          <br />
          Cebine ve gezegene iyi gelsin.
        </h2>
        <p className="mt-3 max-w-md text-mn-text-soft">
          İşletmelerin akşam kalan ürünlerini "Sürpriz Paket" olarak çok daha
          ucuza al. İçinde ne çıkacağı sürpriz — ama keyfi de orada.
        </p>
        <Link
          href="/surpriz-paket"
          className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-mn-eco px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Sürpriz paketleri gör
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="relative aspect-[5/3] lg:aspect-auto">
        <Image
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80&auto=format&fit=crop"
          alt="Taze fırın ürünleri — sürpriz paket"
          fill
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
