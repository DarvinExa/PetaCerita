"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import type { AuthActionState } from "./actions";

type AuthAction = (
  prev: AuthActionState,
  formData: FormData,
) => Promise<AuthActionState>;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" loading={pending}>
      {label}
    </Button>
  );
}

interface AuthFormProps {
  mode: "login" | "register";
  action: AuthAction;
  next?: string;
  submitLabel: string;
}

export function AuthForm({ mode, action, next, submitLabel }: AuthFormProps) {
  const [state, formAction] = useActionState<AuthActionState, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state?.error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger/5 px-3 py-2.5 text-[13px] text-danger"
        >
          <Warning className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{state.error}</span>
        </div>
      ) : null}

      {mode === "register" ? (
        <FormField label="Nama" htmlFor="name" required>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Nama kamu"
            required
          />
        </FormField>
      ) : null}

      <FormField label="Email" htmlFor="email" required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          required
        />
      </FormField>

      <FormField
        label="Kata sandi"
        htmlFor="password"
        required
        helperText={mode === "register" ? "Minimal 8 karakter" : undefined}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={
            mode === "register" ? "new-password" : "current-password"
          }
          placeholder="Kata sandi"
          required
        />
      </FormField>

      <SubmitButton label={submitLabel} />
    </form>
  );
}
