import { createClient } from "@supabase/supabase-js";

// Estos valores son públicos (anon key) — pueden vivir en el bundle.
// En Vercel define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Environment Variables.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://xxwfknicfzizofofihwm.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4d2ZrbmljZnppem9mb2ZpaHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MzI3OTksImV4cCI6MjA5MjMwODc5OX0.lmTar16_FEsgFK8vIErsSAmk2Q-xyvFxw4w0LEZXz4E";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
  },
});

// Constantes de negocio
export const POINTS_PER_COP = 1760; // 1 punto = $1.760 COP
export const calculatePoints = (amountCop: number) =>
  Math.floor(amountCop / POINTS_PER_COP);
