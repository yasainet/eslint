"use client";

import { deleteUser } from "@/features/users/actions/admin";

export function useDeleteUser() {
  return { deleteUser };
}
