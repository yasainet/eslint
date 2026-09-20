import type { Database } from "@/lib/supabase/types";
import type { SnakeToCamel } from "@/utils/mapping";

type UsersRow = Database["public"]["Tables"]["users"]["Row"];

export type User = SnakeToCamel<
  Pick<UsersRow, "id" | "username" | "avatar_path">
>;

export type UpdateUsernameFormState = {
  error: { message: string } | null;
};

export type UpdateAvatarFormState = {
  error: { message: string } | null;
};
