"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-10 w-full rounded-md border bg-white px-3 text-[15px] text-neutral-900",
          "placeholder:text-neutral-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
          invalid
            ? "border-danger focus-visible:ring-danger"
            : "border-neutral-200 focus-visible:ring-teal-600",
          "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-60",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

/** Bungkus input dengan label, helper text, dan pesan error konsisten. */
export function FormField({
  label,
  htmlFor,
  helperText,
  error,
  required,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = htmlFor ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={fieldId}
        className="text-[13px] font-medium text-neutral-700"
      >
        {label}
        {required ? <span className="ml-0.5 text-danger">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-[13px] text-danger">{error}</p>
      ) : helperText ? (
        <p className="text-[13px] text-neutral-600">{helperText}</p>
      ) : null}
    </div>
  );
}
