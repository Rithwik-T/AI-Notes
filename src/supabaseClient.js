import { createClient } from "@supabase/supabase-js";

// Replace these with your actual Supabase project URL and public anon key
const SUPABASE_URL = "https://aiflkospbuiasjnrdtuq.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_JrkiCoiNkrQePSwoHReFLg_PrqSUk02";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
