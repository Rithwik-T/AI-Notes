import { createClient } from '@supabase/supabase-js';

// Replaced with your provided placeholder URL and Key
const SUPABASE_URL = "https://aiflkospbuiasjnrdtuq.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_JrkiCoiNkrQePSwoHReFLg_PrqSUk02";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
