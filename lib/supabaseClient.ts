import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://uuohtsupzecjnqukggqh.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_vqooUCojSsXxvuirPixSqw_MInDcJg6";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
