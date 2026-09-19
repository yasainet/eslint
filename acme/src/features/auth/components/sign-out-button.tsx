import { Button } from "@/components/ui/button";

import { signOut } from "@/features/auth/entries/server";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="outline">
        Sign out
      </Button>
    </form>
  );
}
