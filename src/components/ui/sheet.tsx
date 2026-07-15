"use client";

import { forwardRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

type SheetSide = "bottom" | "right";

const sideClasses: Record<SheetSide, string> = {
  bottom:
    "inset-x-0 bottom-0 max-h-[85vh] rounded-t-lg border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
  right:
    "inset-y-0 right-0 w-full max-w-md border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
};

const SheetOverlay = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-neutral-900/40", className)}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

interface SheetContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  title: string;
  description?: string;
  side?: SheetSide;
}

/** Sheet dari bawah untuk mobile, dari kanan sebagai opsi desktop. */
export const SheetContent = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(
  (
    { className, title, description, side = "bottom", children, ...props },
    ref,
  ) => (
    <DialogPrimitive.Portal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 flex flex-col gap-4 border-neutral-200 bg-white p-6 shadow-md focus:outline-none",
          sideClasses[side],
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <DialogPrimitive.Title className="text-xl font-semibold text-neutral-900">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="text-[15px] text-neutral-600">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          <DialogPrimitive.Close
            className="rounded-md p-1 text-neutral-600 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            aria-label="Tutup"
          >
            <X className="size-5" aria-hidden />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
);
SheetContent.displayName = "SheetContent";
