"use client";

import { deleteUser } from "@/features/users/actions/server";

export function useDeleteUser() {
  return { deleteUser };
}
