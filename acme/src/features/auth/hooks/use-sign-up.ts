"use client";

import { useActionState } from "react";

import { signUp } from "@/features/auth/actions/server";

export function useSignUp() {
  const [state, formAction, pending] = useActionState(signUp, { error: null });

  return { state, formAction, pending };
}
