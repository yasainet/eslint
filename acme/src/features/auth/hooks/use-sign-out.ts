"use client";

import { signOut } from "@/features/auth/entries/server";

export function useSignOut() {
  return { signOut };
}
