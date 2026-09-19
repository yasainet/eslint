"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { updateUsername } from "../entries/server";
import type { UpdateUsernameFormState } from "../types/users";

const initialState: UpdateUsernameFormState = { error: null };

export function UpdateUsernameForm({ username }: { username: string }) {
  const [state, formAction, pending] = useActionState(
    updateUsername,
    initialState,
  );

  return (
    <form action={formAction} className="flex w-80 flex-col gap-4">
      <input
        name="username"
        type="text"
        placeholder="Username"
        defaultValue={username}
        className="rounded border px-3 py-2"
      />
      <p aria-live="polite" className="text-sm text-red-600">
        {state.error?.message}
      </p>
      <Button type="submit" disabled={pending}>
        Update username
      </Button>
    </form>
  );
}
