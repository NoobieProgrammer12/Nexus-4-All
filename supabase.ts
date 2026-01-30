
import { createClient } from '@supabase/supabase-js';

// Support for both Vite (import.meta) and standard (process.env) environments
const getEnv = (key: string) => {
  try {
    return (import.meta as any).env?.[key] || (process as any).env?.[key] || '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to verify if the cloud connection is successfully established
export const isCloudActive = () => !!supabase;
