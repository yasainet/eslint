import type { AuthError } from "@supabase/supabase-js";

import * as authQueriesServer from "@/features/auth/queries/server";
import { signInSchema, signUpSchema } from "@/features/auth/schemas/auth";
import type { AuthFormState, AuthUser } from "@/features/auth/types/auth";

// 想定内の失敗: Supabase が 4xx で断った (登録済みの email、password 違い、未ログインなど)
function isRejected(error: AuthError): boolean {
  return (
    error.status !== undefined && error.status >= 400 && error.status < 500
  );
}

export async function signUp(input: unknown): Promise<AuthFormState> {
  // 想定内の失敗: 入力が不正
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { error: { message: parsed.error.issues[0].message } };
  }

  const { error } = await authQueriesServer.signUp(
    parsed.data.email,
    parsed.data.password,
  );

  if (!error) {
    return { error: null };
  }
  if (isRejected(error)) {
    return { error: { message: error.message } };
  }

  // 想定外の失敗: 通信断など。throw して error.tsx に任せる
  throw error;
}

export async function signIn(input: unknown): Promise<AuthFormState> {
  // 想定内の失敗: 入力が不正
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { error: { message: parsed.error.issues[0].message } };
  }

  const { error } = await authQueriesServer.signIn(
    parsed.data.email,
    parsed.data.password,
  );

  if (!error) {
    return { error: null };
  }
  if (isRejected(error)) {
    return { error: { message: error.message } };
  }

  throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await authQueriesServer.signOut();

  if (error) {
    throw error;
  }
}

export async function getUser(): Promise<AuthUser | null> {
  const { data, error } = await authQueriesServer.getUser();

  if (!error) {
    return { id: data.user.id, email: data.user.email ?? null };
  }
  if (isRejected(error)) {
    return null;
  }

  throw error;
}
