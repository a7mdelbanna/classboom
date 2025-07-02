import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_CLASSBOOM_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_CLASSBOOM_SUPABASE_ANON_KEY;

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

// Factory function to create a ClassBoom client for a specific school schema
export function createClassBoomSchemaClient(schemaName: string) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    db: { schema: schemaName },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Helper to get the current ClassBoom user's school schema
export async function getCurrentSchoolClient() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated ClassBoom user');
  }

  // Get the user's school schema from user metadata
  const schemaName = user.user_metadata?.school_schema;
  
  if (!schemaName) {
    throw new Error('No ClassBoom school schema found for user');
  }

  return createClassBoomSchemaClient(schemaName);
}