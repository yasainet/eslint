"use client";

import { Button } from "@/components/ui/button";

import { useSignOut } from "@/features/auth/hooks/use-sign-out";

export function SignOutButton() {
  const { signOut } = useSignOut();

  return (
    <form action={signOut}>
      <Button type="submit" variant="outline">
        Sign out
      </Button>
    </form>
  );
}
