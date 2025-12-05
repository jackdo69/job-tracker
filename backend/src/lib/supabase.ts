/**
 * Supabase client for Storage operations
 */
import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

if (!config.supabaseUrl || !config.supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY in environment variables.');
}

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

// Storage bucket name
export const STORAGE_BUCKET = 'job-tracker';
