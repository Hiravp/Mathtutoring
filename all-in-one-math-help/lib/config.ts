export const publicConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
};

export const cloudConfigured = Boolean(publicConfig.supabaseUrl && publicConfig.supabaseAnonKey);
