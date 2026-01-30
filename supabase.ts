
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  try {
    // Intenta obtener de import.meta.env (Vite) o process.env
    return (import.meta as any).env?.[key] || (process as any).env?.[key] || '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

// Inicialización segura. Si no hay credenciales, las funciones de la app usarán localStorage como fallback.
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'undefined' && supabaseUrl !== '') 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isCloudActive = () => !!supabase;
