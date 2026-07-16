"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { CircleNotch } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-teal-700 text-white shadow-[0_10px_24px_rgba(15,118,110,0.22)] hover:scale-105 hover:bg-teal-600 hover:brightness-105 active:scale-[0.98] focus-visible:ring-teal-600",
  secondary:
    "border border-white/70 bg-white text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:scale-105 hover:bg-teal-50 hover:brightness-105 active:scale-[0.98] focus-visible:ring-teal-600",
  ghost:
    "text-slate-600 hover:scale-105 hover:bg-white/80 active:scale-[0.98] focus-visible:ring-teal-600",
  danger:
    "bg-danger text-white shadow-[0_10px_24px_rgba(185,28,28,0.16)] hover:scale-105 hover:brightness-110 active:scale-[0.98] focus-visible:ring-danger",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-11 px-3 text-[13px] gap-1.5",
  md: "min-h-11 px-4 text-[15px] gap-2",
  lg: "h-12 px-5 text-[15px] gap-2",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Render sebagai child (misal Link) memakai Radix Slot. */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl font-extrabold transition-all duration-300 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "touch-manipulation disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <CircleNotch className="size-4 animate-spin" aria-hidden />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";
