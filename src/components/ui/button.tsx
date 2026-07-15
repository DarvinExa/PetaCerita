"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { CircleNotch } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 focus-visible:ring-teal-600",
  secondary:
    "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-teal-600",
  ghost:
    "text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-teal-600",
  danger:
    "bg-danger text-white hover:brightness-95 active:brightness-90 focus-visible:ring-danger",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-[15px] gap-2",
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
          "inline-flex items-center justify-center rounded-md font-semibold transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
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
