import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Lazy-initialize the client so module evaluation during the Next.js build
// phase does not throw when env vars are not yet injected.
let _client = null;

function getClient() {
  if (!_client) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Missing Supabase environment variables: " +
          "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set."
      );
    }
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

// Proxy so every existing `supabase.xxx` call works without changes.
export const supabase = new Proxy(
  {},
  {
    get(_, prop) {
      return getClient()[prop];
    },
  }
);
