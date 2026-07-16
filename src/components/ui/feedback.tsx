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
    <div
      className="mx-auto flex min-h-[40vh] w-full max-w-2xl flex-col justify-center gap-5"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-3">
        <Spinner className="size-6" label={label} />
        <p className="text-[14px] font-medium text-neutral-600">{label}...</p>
      </div>
      <div
        className="flex animate-pulse flex-col gap-3 motion-reduce:animate-none"
        aria-hidden
      >
        <div className="h-24 doodle-box border border-white/70 bg-white/80" />
        <div className="h-16 doodle-box border border-white/70 bg-white/65" />
        <div className="h-16 w-4/5 doodle-box border border-white/70 bg-white/50" />
      </div>
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
    <div className="flex flex-col items-center justify-center gap-4 doodle-box-alt border border-dashed border-slate-200/70 bg-white px-6 py-16 text-center">
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
          className="doodle-button inline-flex min-h-11 touch-manipulation items-center justify-center doodle-sticker bg-teal-700 px-4 text-[15px] font-medium text-white transition-all duration-300 ease-in-out hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
