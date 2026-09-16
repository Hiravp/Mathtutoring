import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { publicConfig, cloudConfigured } from './config';

let client: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  if (!cloudConfigured) return null;
  client ??= createClient(publicConfig.supabaseUrl, publicConfig.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}
