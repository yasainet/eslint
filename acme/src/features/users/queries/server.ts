import { createClient } from "@/lib/supabase/server";

export async function getUser(id: string) {
  const supabase = await createClient();

  return supabase
    .from("users")
    .select("id, username")
    .eq("id", id)
    .maybeSingle();
}

export async function updateUsername(id: string, username: string) {
  const supabase = await createClient();

  return supabase.from("users").update({ username }).eq("id", id);
}
