"use client";

import { useActionState } from "react";

import { updateAvatar } from "@/features/users/actions/server";

export function useUpdateAvatar() {
  const [state, formAction, pending] = useActionState(updateAvatar, {
    error: null,
  });

  return { state, formAction, pending };
}
