
import { createClient } from '@supabase/supabase-js';

/**
 * Robust environment variable selector.
 * Searches in import.meta.env (Vite), process.env (Node/Webpack), 
 * and global window context.
 */
const getEnv = (key: string) => {
  try {
    // 1. Try Vite-style env
    const viteEnv = (import.meta as any).env?.[key];
    if (viteEnv) return viteEnv;

    // 2. Try Node-style process.env
    const procEnv = typeof process !== 'undefined' ? (process as any).env?.[key] : undefined;
    if (procEnv) return procEnv;

    // 3. Try global window (sometimes injected)
    const winEnv = (window as any)._env_?.[key] || (window as any)?.[key];
    if (winEnv) return winEnv;

    return '';
  } catch (e) {
    return '';
  }
};

// Check for both prefixed and non-prefixed versions
const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

/**
 * Initialize Supabase Client.
 * We attempt creation even if keys look empty to allow the Supabase 
 * library to throw its own descriptive errors if preferred, 
 * but we export a helper to check health.
 */
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isCloudActive = () => !!supabase;
