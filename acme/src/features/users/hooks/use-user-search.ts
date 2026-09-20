"use client";

import { useEffect, useState } from "react";

import { getUserList } from "@/features/users/loaders/client";
import type { User } from "@/features/users/types/users";

export function useUserSearch() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    let cancelled = false;

    getUserList().then((data) => {
      if (!cancelled) setUsers(data);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const results =
    users?.filter((user) => user.username.includes(keyword.toLowerCase())) ??
    null;

  return { results, keyword, setKeyword };
}
