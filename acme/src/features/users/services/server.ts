import * as authQueriesAdmin from "@/features/auth/queries/admin";
import * as authQueriesServer from "@/features/auth/queries/server";
import * as usersQueriesAdmin from "@/features/users/queries/admin";
import * as usersQueriesGarage from "@/features/users/queries/garage";
import * as usersQueriesServer from "@/features/users/queries/server";
import {
  updateAvatarSchema,
  updateUsernameSchema,
  userIdSchema,
} from "@/features/users/schemas/users";
import type {
  UpdateAvatarFormState,
  UpdateUsernameFormState,
  User,
} from "@/features/users/types/users";

// Postgres の unique 制約違反
const UNIQUE_VIOLATION = "23505";

const AVATAR_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

type UserRow = { id: string; username: string; avatar_path: string | null };

function toUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    avatarUrl: row.avatar_path
      ? `${process.env.AVATARS_BASE_URL}/${row.avatar_path}`
      : null,
  };
}

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

  return data ? toUser(data) : null;
}

export async function getUserList(): Promise<User[]> {
  const { data, error } = await usersQueriesServer.getUserList();

  if (error) {
    throw error;
  }

  return data.map(toUser);
}

export async function getUser(input: unknown): Promise<User | null> {
  // 想定内の失敗: id の形が不正 (URL を手で書き換えたなど)。見つからない扱いにする
  const parsed = userIdSchema.safeParse(input);
  if (!parsed.success) {
    return null;
  }

  const { data, error } = await usersQueriesServer.getUser(parsed.data);

  if (error) {
    throw error;
  }

  return data ? toUser(data) : null;
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

export async function updateAvatar(
  input: unknown,
): Promise<UpdateAvatarFormState> {
  // 想定内の失敗: 入力が不正
  const parsed = updateAvatarSchema.safeParse(input);
  if (!parsed.success) {
    return { error: { message: parsed.error.issues[0].message } };
  }

  const id = await getAuthUserId();
  if (!id) {
    return { error: { message: "Sign in required" } };
  }

  const { avatar } = parsed.data;
  const avatarPath = `${id}/${crypto.randomUUID()}.${AVATAR_EXTENSIONS[avatar.type]}`;

  // Garage (S3 SDK) は失敗すると throw する。想定内の失敗は無いので、そのまま上に流す
  await usersQueriesGarage.uploadAvatar(
    avatarPath,
    new Uint8Array(await avatar.arrayBuffer()),
    avatar.type,
  );

  const { error } = await usersQueriesServer.updateAvatarPath(id, avatarPath);

  if (error) {
    throw error;
  }

  return { error: null };
}

export async function deleteUser(): Promise<void> {
  const id = await getAuthUserId();
  // 未ログインなら、消す対象がいない
  if (!id) {
    return;
  }

  // 本人の権限では deleted_at を更新できない (RLS) ので、admin client を使う
  const { error } = await usersQueriesAdmin.deleteUser(id);
  if (error) {
    throw error;
  }

  const { error: authError } = await authQueriesAdmin.deleteUser(id);
  if (authError) {
    throw authError;
  }

  const { error: signOutError } = await authQueriesServer.signOut();
  if (signOutError) {
    throw signOutError;
  }
}
