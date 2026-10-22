"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { CircleNotch } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "accent" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "clay-btn-primary focus-visible:ring-teal-700",
  secondary: "clay-btn-secondary focus-visible:ring-slate-800",
  accent: "clay-btn-terracotta focus-visible:ring-coral-500",
  ghost:
    "bg-transparent text-slate-700 hover:bg-white/80 hover:shadow-sm focus-visible:ring-slate-800 rounded-2xl transition-all",
  danger:
    "bg-coral-50 text-danger border border-coral-200/80 shadow-[0_4px_12px_rgba(197,48,48,0.12),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(197,48,48,0.12)] hover:bg-coral-100 focus-visible:ring-danger rounded-2xl",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4.5 py-2 text-[13px] gap-2 rounded-xl whitespace-nowrap shrink-0",
  md: "min-h-11 px-6 py-2.5 text-[14px] gap-2.5 rounded-2xl whitespace-nowrap shrink-0",
  lg: "min-h-12 px-7 py-3 text-[15px] gap-3 rounded-2xl whitespace-nowrap shrink-0",
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
          "inline-flex items-center justify-center font-bold tracking-[-0.01em]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "touch-manipulation disabled:pointer-events-none disabled:opacity-50 select-none",
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
