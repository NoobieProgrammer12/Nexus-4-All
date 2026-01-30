
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  try {
    return (import.meta as any).env?.[key] || (process as any).env?.[key] || '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

// Solo inicializamos si tenemos las credenciales. Si no, exportamos null de forma segura.
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'undefined') 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isCloudActive = () => !!supabase;
