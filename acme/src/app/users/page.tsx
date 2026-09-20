import Link from "next/link";

import { UserSearch } from "@/features/users/components/user-search";
import { getUserList } from "@/features/users/loaders/server";

export default async function UsersPage() {
  const users = await getUserList();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-semibold">Users</h1>
      <UserSearch />
      <h2 className="font-semibold">All users (server)</h2>
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
