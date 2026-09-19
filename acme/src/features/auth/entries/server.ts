"use server";

import { redirect } from "next/navigation";

import { signInSchema, signUpSchema } from "@/features/auth/schemas/auth";
import * as authServicesServer from "@/features/auth/services/server";
import type { AuthFormState, AuthUser } from "@/features/auth/types/auth";

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: { message: parsed.error.issues[0].message } };
  }

  const result = await authServicesServer.signUp(
    parsed.data.email,
    parsed.data.password,
  );

  if (result.error) {
    return result;
  }

  redirect("/");
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: { message: parsed.error.issues[0].message } };
  }

  const result = await authServicesServer.signIn(
    parsed.data.email,
    parsed.data.password,
  );

  if (result.error) {
    return result;
  }

  redirect("/");
}

export async function signOut(): Promise<void> {
  await authServicesServer.signOut();

  redirect("/sign-in");
}

export async function getUser(): Promise<AuthUser | null> {
  return authServicesServer.getUser();
}
