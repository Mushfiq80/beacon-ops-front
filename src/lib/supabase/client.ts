/* Supabase browser client. Returns null until the env keys are set, so the
   app keeps running on demo data. Keys go in frontend/.env.local (see .env.example). */

import { createBrowserClient } from "@supabase/ssr";

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}

export const isLive = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
  process.env.NEXT_PUBLIC_DATA_MODE === "live";
