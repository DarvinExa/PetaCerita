"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { CircleNotch } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-sand-200 text-slate-900 hover:bg-sand-100 focus-visible:ring-slate-800",
  secondary:
    "bg-white text-slate-800 hover:bg-sky-50 focus-visible:ring-slate-800",
  ghost:
    "bg-transparent text-slate-700 hover:bg-white focus-visible:ring-slate-800",
  danger:
    "bg-coral-100 text-danger hover:bg-coral-50 focus-visible:ring-danger",
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
          "doodle-button inline-flex items-center justify-center font-bold",
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
