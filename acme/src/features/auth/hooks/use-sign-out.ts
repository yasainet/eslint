"use client";

import { signOut } from "@/features/auth/actions/server";

export function useSignOut() {
  return { signOut };
}
