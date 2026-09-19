import type { AuthError } from "@supabase/supabase-js";

import * as authServerQuery from "@/features/auth/queries/server";
import type { AuthFormState, AuthUser } from "@/features/auth/types/auth";

// 想定内の失敗: Supabase が 4xx で断った (登録済みの email、password 違い、未ログインなど)
function isRejected(error: AuthError): boolean {
  return (
    error.status !== undefined && error.status >= 400 && error.status < 500
  );
}

export async function signUp(
  email: string,
  password: string,
): Promise<AuthFormState> {
  const { error } = await authServerQuery.signUp(email, password);

  if (!error) {
    return { error: null };
  }
  if (isRejected(error)) {
    return { error: { message: error.message } };
  }

  // 想定外の失敗: 通信断など。throw して error.tsx に任せる
  throw error;
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthFormState> {
  const { error } = await authServerQuery.signIn(email, password);

  if (!error) {
    return { error: null };
  }
  if (isRejected(error)) {
    return { error: { message: error.message } };
  }

  throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await authServerQuery.signOut();

  if (error) {
    throw error;
  }
}

export async function getUser(): Promise<AuthUser | null> {
  const { data, error } = await authServerQuery.getUser();

  if (!error) {
    return { id: data.user.id, email: data.user.email ?? null };
  }
  if (isRejected(error)) {
    return null;
  }

  throw error;
}
