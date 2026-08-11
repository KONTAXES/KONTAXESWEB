import { createClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL  as string;
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

export type SaConfig = {
  id: string;
  active: boolean;
  updated_at: string;
};

export type SaRegistration = {
  id: string;
  email: string;
  progress: Record<string, unknown>;
  completed: boolean;
  created_at: string;
  updated_at: string;
};
