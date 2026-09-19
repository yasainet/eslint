"use client";

import { useActionState } from "react";

import { signIn } from "@/features/auth/entries/server";

export function useSignIn() {
  const [state, formAction, pending] = useActionState(signIn, { error: null });

  return { state, formAction, pending };
}
