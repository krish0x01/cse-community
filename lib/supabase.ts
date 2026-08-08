import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === "string" &&
    supabaseUrl.trim().length > 0 &&
    !supabaseUrl.includes("your-project-id") &&
    typeof supabaseAnonKey === "string" &&
    supabaseAnonKey.trim().length > 0
  );
};

// Public client for browser & edge queries
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Server-side admin client (optional, uses service role key if available)
export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  if (!isSupabaseConfigured()) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
};
