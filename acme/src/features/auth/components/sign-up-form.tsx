"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { signUp } from "../entries/server";
import type { AuthFormState } from "../types/auth";

const initialState: AuthFormState = { error: null };

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

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
      <Button type="submit" disabled={pending}>Sign up</Button>
    </form>
  );
}
