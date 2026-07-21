import Image from "next/image";
import { cn } from "@/lib/cn";

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
  priority?: boolean;
};

/** Identitas visual PetaCerita dengan mark resmi dan wordmark yang konsisten. */
export function BrandLogo({
  className,
  compact = false,
  priority = false,
}: BrandLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-teal-800",
        compact ? "gap-2" : "gap-3",
        className,
      )}
    >
      <Image
        src="/brand/petacerita-mark.svg"
        alt=""
        width={compact ? 30 : 52}
        height={compact ? 40 : 69}
        priority={priority}
        className={cn("shrink-0", compact ? "h-8 w-6" : "h-[60px] w-[45px]")}
      />
      <span
        className={cn(
          "font-extrabold tracking-[-0.025em]",
          compact ? "text-[16px]" : "text-[24px] sm:text-[26px]",
        )}
      >
        PetaCerita
      </span>
    </span>
  );
}
