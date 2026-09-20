"use client";

import Link from "next/link";

import { useUserSearch } from "@/features/users/hooks/use-user-search";

export function UserSearch() {
  const { results, keyword, setKeyword } = useUserSearch();

  return (
    <div className="flex w-80 flex-col gap-4">
      <input
        type="search"
        placeholder="Search username"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        className="rounded border px-3 py-2"
      />
      {results === null ? (
        <p>Loading...</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {results.map((user) => (
            <li key={user.id}>
              <Link href={`/users/${user.id}`}>{user.username}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
