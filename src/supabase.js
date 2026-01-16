import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wxqyshhfzuryzhjnssjg.supabase.co";
const supabaseKey = "sb_publishable_1-azRFwROJBB0FC_cFPJGQ_X7qBCXgY";

export const supabase = createClient(supabaseUrl, supabaseKey);
