import * as authQueriesAdmin from "@/features/auth/queries/admin";
import * as authQueriesServer from "@/features/auth/queries/server";
import * as usersQueriesAdmin from "@/features/users/queries/admin";

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
