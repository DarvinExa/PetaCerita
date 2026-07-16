"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/feedback";

/**
 * Error boundary untuk seluruh area terautentikasi. Menangkap error tak terduga
 * dari Server Component maupun render client, lalu menawarkan coba lagi (reset).
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log untuk diagnosa; detail error tidak ditampilkan ke user.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-16">
      <ErrorState onRetry={reset} />
    </div>
  );
}
