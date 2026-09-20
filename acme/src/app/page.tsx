import Image from "next/image";
import Link from "next/link";

import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { UpdateAvatarForm } from "@/features/users/components/update-avatar-form";
import { UpdateUsernameForm } from "@/features/users/components/update-username-form";
import { getCurrentUser } from "@/features/users/loaders/server";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      {user ? (
        <>
          {user.avatarUrl && (
            <Image
              src={user.avatarUrl}
              alt={user.username}
              width={96}
              height={96}
              unoptimized
              className="size-24 rounded-full object-cover"
            />
          )}
          <p>Signed in as {user.username}</p>
          <UpdateAvatarForm />
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
