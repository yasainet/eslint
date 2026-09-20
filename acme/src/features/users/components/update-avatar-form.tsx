"use client";

import { Button } from "@/components/ui/button";

import { useUpdateAvatar } from "@/features/users/hooks/use-update-avatar";

export function UpdateAvatarForm() {
  const { state, formAction, pending } = useUpdateAvatar();

  return (
    <form action={formAction} className="flex w-80 flex-col gap-4">
      <input
        name="avatar"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="rounded border px-3 py-2"
      />
      <p aria-live="polite" className="text-sm text-red-600">
        {state.error?.message}
      </p>
      <Button type="submit" disabled={pending}>
        Update avatar
      </Button>
    </form>
  );
}
