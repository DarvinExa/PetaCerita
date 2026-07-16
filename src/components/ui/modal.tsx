"use client";

import { forwardRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

export const Modal = DialogPrimitive.Root;
export const ModalTrigger = DialogPrimitive.Trigger;
export const ModalClose = DialogPrimitive.Close;

const ModalOverlay = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-[1px]",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
ModalOverlay.displayName = "ModalOverlay";

interface ModalContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  title: string;
  description?: string;
}

/** Modal tengah untuk desktop. Judul wajib demi aksesibilitas. */
export const ModalContent = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(({ className, title, description, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <ModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2",
        "max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-white/70 bg-white p-4 shadow-[0_18px_50px_rgba(15,118,110,0.12)] focus:outline-none sm:p-6",
        className,
      )}
      {...props}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
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
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-neutral-600 transition-all duration-300 ease-in-out hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          aria-label="Tutup"
        >
          <X className="size-5" aria-hidden />
        </DialogPrimitive.Close>
      </div>
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
ModalContent.displayName = "ModalContent";
