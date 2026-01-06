// Centralized Supabase client for the application
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug: Log Supabase configuration status
console.log('🔧 Supabase config check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  urlIsPlaceholder: supabaseUrl === 'placeholder_url',
  keyIsPlaceholder: supabaseKey === 'placeholder_key',
});

// Check if we have valid Supabase credentials
export const hasValidSupabaseConfig = !!(supabaseUrl && supabaseKey && 
  supabaseUrl !== 'placeholder_url' && 
  supabaseKey !== 'placeholder_key');

console.log('🔧 Supabase hasValidConfig:', hasValidSupabaseConfig);

// Create client only if we have valid credentials
export const supabase = hasValidSupabaseConfig 
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

console.log('🔧 Supabase client created:', supabase !== null);
