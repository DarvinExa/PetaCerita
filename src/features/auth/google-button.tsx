"use client";

import { useFormStatus } from "react-dom";
import { GoogleLogo } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { loginWithGoogle } from "./actions";

/** Tombol submit terpisah agar bisa membaca status pending form OAuth. */
function GoogleSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="secondary"
      size="lg"
      className="w-full"
      loading={pending}
    >
      <GoogleLogo className="size-5" weight="bold" aria-hidden />
      <span>Lanjut dengan Google</span>
    </Button>
  );
}

export function GoogleButton({ next }: { next?: string }) {
  return (
    <form action={loginWithGoogle}>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <GoogleSubmit />
    </form>
  );
}
