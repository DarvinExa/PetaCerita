import { CircleNotch, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";

/**
 * Komponen umpan balik bersama: spinner loading dan tampilan error, dipakai oleh
 * loading.tsx dan error.tsx per rute maupun inline. Server-safe (ikon dari
 * /dist/ssr, tanpa hook), jadi bisa dipakai di Server maupun Client Component.
 */

/** Spinner ringan dengan label untuk screen reader. */
export function Spinner({
  className,
  label = "Memuat",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span role="status" aria-live="polite">
      <CircleNotch
        className={cn("size-5 animate-spin text-teal-600", className)}
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Blok loading terpusat untuk mengisi area halaman. */
export function LoadingBlock({ label = "Memuat" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <Spinner className="size-7" label={label} />
      <p className="text-[13px] text-neutral-500">{label}...</p>
    </div>
  );
}

/**
 * Tampilan error yang dirancang, bukan halaman kosong. Bila diberi onRetry,
 * menampilkan tombol coba lagi (dipakai error.tsx dengan reset()).
 */
export function ErrorState({
  title = "Ada yang tidak beres",
  description = "Coba muat ulang halaman. Bila masih gagal, coba lagi sebentar.",
  onRetry,
  retryLabel = "Coba lagi",
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <WarningCircle className="size-6" aria-hidden />
      </div>
      <div>
        <p className="font-semibold text-neutral-900">{title}</p>
        <p className="mt-1 text-[13px] text-neutral-600">{description}</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-10 items-center justify-center rounded-md bg-teal-600 px-4 text-[15px] font-medium text-white transition-colors hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
