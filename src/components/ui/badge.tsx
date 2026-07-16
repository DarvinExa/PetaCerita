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
        "doodle-tag inline-flex items-center px-3 py-1 text-[12px] font-extrabold ",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
