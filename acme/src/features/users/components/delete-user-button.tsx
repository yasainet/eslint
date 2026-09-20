"use client";

import { Button } from "@/components/ui/button";

import { useDeleteUser } from "@/features/users/hooks/use-delete-user";

export function DeleteUserButton() {
  const { deleteUser } = useDeleteUser();

  return (
    <form action={deleteUser}>
      <Button type="submit" variant="destructive">
        Delete account
      </Button>
    </form>
  );
}
