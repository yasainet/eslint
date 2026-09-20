"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function updateAvatar(_prevState: unknown, formData: FormData) {
  const result = await usersServicesServer.updateAvatar({
    avatar: formData.get("avatar"),
  });

  if (result.error) {
    return result;
  }

  revalidatePath("/");
  return result;
}

export async function deleteUser() {
  await usersServicesServer.deleteUser();

  redirect("/");
}
