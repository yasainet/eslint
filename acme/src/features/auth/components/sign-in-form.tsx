"use client";

import { Button } from "@/components/ui/button";

import { useSignIn } from "@/features/auth/hooks/use-sign-in";

export function SignInForm() {
  const { state, formAction, pending } = useSignIn();

  return (
    <form action={formAction} className="flex w-80 flex-col gap-4">
      <input
        name="email"
        type="text"
        placeholder="Email"
        className="rounded border px-3 py-2"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        className="rounded border px-3 py-2"
      />
      <p aria-live="polite" className="text-sm text-red-600">
        {state.error?.message}
      </p>
      <Button type="submit" disabled={pending}>
        Sign in
      </Button>
    </form>
  );
}
