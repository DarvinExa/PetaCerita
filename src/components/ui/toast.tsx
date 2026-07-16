"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle, Warning, Info, X } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "danger" | "info";

interface ToastData {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  notify: (toast: Omit<ToastData, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneConfig: Record<
  ToastTone,
  { icon: typeof CheckCircle; className: string }
> = {
  success: { icon: CheckCircle, className: "text-success" },
  danger: { icon: Warning, className: "text-danger" },
  info: { icon: Info, className: "text-info" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const notify = useCallback((toast: Omit<ToastData, "id">) => {
    setToasts((prev) => [
      ...prev,
      { ...toast, id: Date.now() + Math.random() },
    ]);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((toast) => {
          const { icon: Icon, className } = toneConfig[toast.tone];
          return (
            <ToastPrimitive.Root
              key={toast.id}
              onOpenChange={(open) => {
                if (!open) {
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                }
              }}
              className={cn(
                "flex items-start gap-3 rounded-md border border-neutral-200 bg-white p-4 shadow-md",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out",
              )}
            >
              <Icon
                className={cn("mt-0.5 size-5 shrink-0", className)}
                aria-hidden
              />
              <div className="flex flex-col gap-0.5">
                <ToastPrimitive.Title className="text-[15px] font-semibold text-neutral-900">
                  {toast.title}
                </ToastPrimitive.Title>
                {toast.description ? (
                  <ToastPrimitive.Description className="text-[13px] text-neutral-600">
                    {toast.description}
                  </ToastPrimitive.Description>
                ) : null}
              </div>
              <ToastPrimitive.Close
                className="ml-auto flex size-11 shrink-0 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                aria-label="Tutup"
              >
                <X className="size-4" aria-hidden />
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          );
        })}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-50 flex w-full max-w-sm flex-col gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

/** Akses fungsi notify. Harus di dalam ToastProvider. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast harus dipakai di dalam ToastProvider");
  }
  return ctx;
}

/** Ekspor primitive Root jika perlu kustomisasi lanjutan. */
export const ToastRoot = forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>
>((props, ref) => <ToastPrimitive.Root ref={ref} {...props} />);
ToastRoot.displayName = "ToastRoot";
