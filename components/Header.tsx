import Link from "next/link";
import { Search, User2, Store } from "lucide-react";
import { LocationPicker } from "@/components/LocationPicker";
import { UserMenu } from "@/components/UserMenu";
import { getCurrentProfile } from "@/app/_actions/profile";

export async function Header() {
  // PostgREST'i bypass'layan direct pg sorgusu
  let user: Awaited<ReturnType<typeof getCurrentProfile>> = null;
  try {
    user = await getCurrentProfile();
  } catch (e) {
    console.error("[Header] profile read failed:", e);
    user = null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-mn-border bg-mn-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft">
            <span className="h-2.5 w-2.5 rounded-full bg-white" />
          </span>
          <span className="text-lg font-bold tracking-tight">Mavi Nokta</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <NavLink href="/">Fırsatlar</NavLink>
          <NavLink href="/surpriz-paket">Sürpriz Paket</NavLink>
          <NavLink href="/harita">Harita</NavLink>
          <NavLink href="/isletmeler">İşletmeler</NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="hidden h-10 items-center gap-2 rounded-full border border-mn-border bg-mn-surface px-3.5 text-sm text-mn-text-soft transition hover:border-mn-border-strong sm:flex"
          >
            <Search className="h-4 w-4" />
            <span>Ne yiyelim, ne içelim?</span>
            <kbd className="ml-2 rounded-md border border-mn-border bg-mn-surface-2 px-1.5 py-0.5 text-[10px] text-mn-text-mute">
              ⌘K
            </kbd>
          </button>

          <LocationPicker />

          {user ? (
            <UserMenu name={user.name} email={user.email} role={user.role} />
          ) : (
            <>
              <Link
                href="/giris/musteri"
                className="hidden h-10 items-center gap-2 rounded-full border border-mn-border bg-mn-surface px-3.5 text-sm font-medium text-mn-text transition hover:border-mn-border-strong sm:flex"
              >
                <User2 className="h-4 w-4" />
                Giriş
              </Link>
              <Link
                href="/giris/isletme"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-mn-text px-4 text-sm font-semibold text-white transition hover:bg-black"
              >
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">İşletme Girişi</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-1.5 text-sm font-medium text-mn-text-soft transition hover:bg-mn-surface-2 hover:text-mn-text"
    >
      {children}
    </Link>
  );
}
