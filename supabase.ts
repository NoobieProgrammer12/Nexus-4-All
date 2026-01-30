
import { createClient } from '@supabase/supabase-js';

// Estas variables se configuran en el panel de Vercel o en un archivo .env local
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper para verificar si estamos en modo "Cloud" o "Local"
export const isCloudActive = () => !!supabase;
