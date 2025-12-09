import { createClient } from '@supabase/supabase-js';

// Use Vite environment variables. Create a `.env` with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
// Falls back to placeholders if env vars are not present (useful during quick testing).
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://teynjsifmwggrwekhviz.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'REPLACE_WITH_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
