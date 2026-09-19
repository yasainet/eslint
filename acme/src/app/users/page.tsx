import Link from "next/link";

import { getUserList } from "@/features/users/entries/server";

export default async function UsersPage() {
  const users = await getUserList();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-semibold">Users</h1>
      <ul className="flex flex-col gap-2">
        {users.map((user) => (
          <li key={user.id}>
            <Link href={`/users/${user.id}`}>{user.username}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
