/**
 * Supabase client for Storage operations
 * Uses service role key to bypass RLS for backend operations
 */
import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
  throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment variables.');
}

console.log('🔧 Supabase client configuration:', {
  url: config.supabaseUrl,
  hasServiceRoleKey: !!config.supabaseServiceRoleKey,
  serviceRoleKeyLength: config.supabaseServiceRoleKey.length,
  serviceRoleKeyPrefix: config.supabaseServiceRoleKey.substring(0, 20) + '...',
  bucket: 'job-tracker'
});

export const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Storage bucket name
export const STORAGE_BUCKET = 'job-tracker';
