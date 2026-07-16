import Link from "next/link";
import {
  MapTrifold,
  SignOut,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import { logout } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

/** Header untuk area terautentikasi: brand, nama user, dan logout. */
export function AppHeader({ userName }: { userName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/90 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="group flex min-h-11 items-center gap-2.5 rounded-md text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-4"
        >
          <span className="flex size-9 items-center justify-center rounded-md bg-teal-800 text-white shadow-sm transition-transform group-hover:-rotate-2">
            <MapTrifold className="size-5" weight="bold" aria-hidden />
          </span>
          <span className="text-[15px] font-bold tracking-[-0.01em]">
            PetaCerita
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-md bg-neutral-100 px-2.5 py-1.5 text-[13px] font-medium text-neutral-700 sm:inline-flex">
            <UserCircle className="size-4 text-neutral-500" aria-hidden />
            {userName}
          </span>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              <SignOut className="size-4" aria-hidden />
              <span>Keluar</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
