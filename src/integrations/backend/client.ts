import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// NOTE:
// - In Lovable projects, env vars are usually injected automatically.
// - If they aren't available for some reason, we fall back to the publishable URL/key.
//   (These are safe to ship; do NOT put service role keys in client code.)

const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  (import.meta as any).env?.SUPABASE_URL ||
  "https://besyfhpuwyaqullafuxm.supabase.co";

const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (import.meta as any).env?.SUPABASE_PUBLISHABLE_KEY ||
  (import.meta as any).env?.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3lmaHB1d3lhcXVsbGFmdXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MTYxOTcsImV4cCI6MjA4MzQ5MjE5N30.f0DL-mnjK4-aLyCam-mIljMYkdoNDZum97Nrt65aeQU";

// Export typed Supabase client
export const backend = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Type exports for convenience
export type { Database };
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
