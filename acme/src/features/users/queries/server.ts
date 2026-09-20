import { createClient } from "@/lib/supabase/server";

export async function getUser(id: string) {
  const supabase = await createClient();

  return supabase
    .from("users")
    .select("id, username, avatar_path")
    .eq("id", id)
    .maybeSingle();
}

export async function updateUsername(id: string, username: string) {
  const supabase = await createClient();

  return supabase.from("users").update({ username }).eq("id", id);
}

export async function updateAvatarPath(id: string, avatarPath: string) {
  const supabase = await createClient();

  return supabase
    .from("users")
    .update({ avatar_path: avatarPath })
    .eq("id", id);
}

export async function getUserList() {
  const supabase = await createClient();

  return supabase
    .from("users")
    .select("id, username, avatar_path")
    .order("created_at", { ascending: false });
}
