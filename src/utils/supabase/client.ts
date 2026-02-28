import { createClient } from '@supabase/supabase-js';

// Safely fallback to empty strings during Vercel build if env vars aren't set yet
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(
    supabaseUrl || 'https://placeholder-project.supabase.co',
    supabaseKey || 'placeholder-anon-key'
);
