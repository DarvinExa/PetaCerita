import Link from "next/link";
import { MapTrifold } from "@phosphor-icons/react/dist/ssr";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-full flex-col items-center justify-center app-canvas px-4 py-12">
      <div className="w-full max-w-[440px] rounded-[32px] bg-white/75 p-5 shadow-[0_24px_70px_rgba(15,118,110,0.12)] backdrop-blur-xl sm:p-8">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-teal-700"
        >
          <MapTrifold className="size-6" weight="bold" aria-hidden />
          <span className="text-lg font-bold">PetaCerita</span>
        </Link>
        {children}
      </div>
    </main>
  );
}
