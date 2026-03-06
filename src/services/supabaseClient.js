import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://efnsirddtyepqphzomax.supabase.co";
const supabaseKey = "sb_publishable_TqFKlqO0JdD6yLpuTA7-QA_mR3m1GGb";

export const supabase = createClient(supabaseUrl, supabaseKey);