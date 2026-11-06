import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Supabase is only initialised when real env vars are present.
// Without them (local dev / GitHub Pages demo) all Supabase calls are no-ops.
const isConfigured = !!SUPABASE_URL && !!SUPABASE_PUBLISHABLE_KEY;

// Minimal valid Supabase client used only when env vars are set.
// Falls back to a safe stub otherwise so the app never crashes on load.
export const supabase = isConfigured
  ? createClient<Database>(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!)
  : ({
      functions: {
        invoke: async () => ({ data: null, error: new Error('Supabase not configured') }),
      },
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as unknown as ReturnType<typeof createClient<Database>>);
