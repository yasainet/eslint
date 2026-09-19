"use server";

import { revalidatePath } from "next/cache";

import { updateUsernameSchema } from "@/features/users/schemas/users";
import * as usersServicesServer from "@/features/users/services/server";
import type {
  UpdateUsernameFormState,
  User,
} from "@/features/users/types/users";

export async function getCurrentUser(): Promise<User | null> {
  return usersServicesServer.getCurrentUser();
}

export async function updateUsername(
  _prevState: UpdateUsernameFormState,
  formData: FormData,
): Promise<UpdateUsernameFormState> {
  const parsed = updateUsernameSchema.safeParse({
    username: formData.get("username"),
  });

  if (!parsed.success) {
    return { error: { message: parsed.error.issues[0].message } };
  }

  const result = await usersServicesServer.updateUsername(parsed.data.username);

  if (result.error) {
    return result;
  }

  revalidatePath("/");
  return { error: null };
}
