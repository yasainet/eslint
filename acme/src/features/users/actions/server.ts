"use server";

import { revalidatePath } from "next/cache";

import * as usersServicesServer from "@/features/users/services/server";

export async function updateUsername(_prevState: unknown, formData: FormData) {
  const result = await usersServicesServer.updateUsername({
    username: formData.get("username"),
  });

  if (result.error) {
    return result;
  }

  revalidatePath("/");
  return result;
}
