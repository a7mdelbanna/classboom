import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing ClassBoom Supabase environment variables');
}

// Main ClassBoom Supabase client for public schema
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});


// Helper to get current user's school information
export async function getCurrentUserSchool() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user');
  }

  // Get the user's school from the database
  const { data: school, error } = await supabase
    .from('schools')
    .select('*')
    .eq('owner_id', user.id)
    .single();
  
  if (error || !school) {
    throw new Error('No school found for user');
  }

  return school;
}