import { cn } from "@/lib/cn";

type BadgeVariant =
  "neutral" | "teal" | "success" | "warning" | "danger" | "info";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-neutral-100 text-neutral-700 border-white/70",
  teal: "bg-teal-50 text-teal-800 border-teal-200",
  success: "bg-white text-success border-success/30",
  warning: "bg-white text-warning border-warning/30",
  danger: "bg-white text-danger border-danger/30",
  info: "bg-white text-info border-info/30",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/70 px-3 py-1 text-[12px] font-extrabold shadow-[0_5px_14px_rgba(15,23,42,0.04)]",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
