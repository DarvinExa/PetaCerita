import Link from "next/link";
import { MapTrifold, SignOut } from "@phosphor-icons/react/dist/ssr";
import { logout } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

/** Header untuk area terautentikasi: brand, nama user, dan logout. */
export function AppHeader({ userName }: { userName: string }) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-teal-700"
        >
          <MapTrifold className="size-6" weight="bold" aria-hidden />
          <span className="text-base font-bold">PetaCerita</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden text-[13px] text-neutral-600 sm:inline">
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
