import * as authQueriesServer from "@/features/auth/queries/server";
import * as usersQueriesServer from "@/features/users/queries/server";
import { updateUsernameSchema } from "@/features/users/schemas/users";
import type {
  UpdateUsernameFormState,
  User,
} from "@/features/users/types/users";

// Postgres の unique 制約違反
const UNIQUE_VIOLATION = "23505";

async function getAuthUserId(): Promise<string | null> {
  const { data, error } = await authQueriesServer.getUser();

  if (!error) {
    return data.user.id;
  }
  // 想定内の失敗: 未ログイン (4xx)
  if (error.status !== undefined && error.status >= 400 && error.status < 500) {
    return null;
  }

  throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const id = await getAuthUserId();
  if (!id) {
    return null;
  }

  const { data, error } = await usersQueriesServer.getUser(id);

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUsername(
  input: unknown,
): Promise<UpdateUsernameFormState> {
  // 想定内の失敗: 入力が不正
  const parsed = updateUsernameSchema.safeParse(input);
  if (!parsed.success) {
    return { error: { message: parsed.error.issues[0].message } };
  }

  const id = await getAuthUserId();
  if (!id) {
    return { error: { message: "Sign in required" } };
  }

  const { error } = await usersQueriesServer.updateUsername(
    id,
    parsed.data.username,
  );

  if (!error) {
    return { error: null };
  }
  // 想定内の失敗: 他の user が使っている username
  if (error.code === UNIQUE_VIOLATION) {
    return { error: { message: "Username is already taken" } };
  }

  throw error;
}
