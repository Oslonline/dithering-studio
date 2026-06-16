"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClientConfig } from "./config";

let browserClient: SupabaseClient | null = null;

export const getSupabaseBrowserClient = (): SupabaseClient | null => {
  if (browserClient) return browserClient;
  const config = getSupabaseClientConfig();
  if (!config) return null;
  browserClient = createBrowserClient(config.url, config.anonKey);
  return browserClient;
};
