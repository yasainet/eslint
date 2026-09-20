import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteUser(id: string) {
  const supabase = createAdminClient();

  return supabase.auth.admin.deleteUser(id, true);
}
