"use server";

import { redirect } from "next/navigation";

import * as usersServicesAdmin from "@/features/users/services/admin";

export async function deleteUser() {
  await usersServicesAdmin.deleteUser();

  redirect("/");
}
