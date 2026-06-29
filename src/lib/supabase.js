import { createClient } from "@supabase/supabase-js";

// Local dev uses VITE_SUPABASE_*, while Vercel's Supabase integration
// injects SUPABASE_* (no VITE_ prefix) — support both.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase env vars are missing. Set VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY (local) " +
      "or ensure the Vercel Supabase integration env vars are available at build time."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
