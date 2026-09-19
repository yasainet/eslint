import Link from "next/link";
import { notFound } from "next/navigation";

import { getUser } from "@/features/users/entries/server";

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-semibold">{user.username}</h1>
      <p className="text-sm text-zinc-500">{user.id}</p>
      <Link href="/users">Back to users</Link>
    </main>
  );
}
