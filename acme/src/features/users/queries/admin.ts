import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteUser(id: string) {
  const supabase = createAdminClient();

  return supabase
    .from("users")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
}
