import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";

export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.SUPABASE_INTERNAL_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
