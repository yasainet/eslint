import { createClient } from "@/lib/supabase/client";

export async function getUserList() {
  const supabase = createClient();

  return supabase
    .from("users")
    .select("id, username, avatar_path")
    .order("created_at", { ascending: false });
}
