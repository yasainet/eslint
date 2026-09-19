"use server";

import { redirect } from "next/navigation";

import * as authServicesServer from "@/features/auth/services/server";

export async function signUp(_prevState: unknown, formData: FormData) {
  const result = await authServicesServer.signUp({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (result.error) {
    return result;
  }

  redirect("/");
}

export async function signIn(_prevState: unknown, formData: FormData) {
  const result = await authServicesServer.signIn({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (result.error) {
    return result;
  }

  redirect("/");
}

export async function signOut() {
  await authServicesServer.signOut();

  redirect("/sign-in");
}
