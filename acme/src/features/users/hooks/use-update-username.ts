"use client";

import { useActionState } from "react";

import { updateUsername } from "@/features/users/entries/server";

export function useUpdateUsername() {
  const [state, formAction, pending] = useActionState(updateUsername, {
    error: null,
  });

  return { state, formAction, pending };
}
