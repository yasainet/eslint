import Link from "next/link";

import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { UpdateUsernameForm } from "@/features/users/components/update-username-form";
import { getCurrentUser } from "@/features/users/entries/server";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      {user ? (
        <>
          <p>Signed in as {user.username}</p>
          <UpdateUsernameForm username={user.username} />
          <SignOutButton />
        </>
      ) : (
        <>
          <p>Not signed in</p>
          <Link href="/sign-in">Sign in</Link>
          <Link href="/sign-up">Sign up</Link>
        </>
      )}
    </main>
  );
}
