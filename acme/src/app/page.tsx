import Link from "next/link";

import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { getUser } from "@/features/auth/entries/server";

export default async function HomePage() {
  const user = await getUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      {user ? (
        <>
          <p>Signed in as {user.email}</p>
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
