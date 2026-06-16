import { createClient } from "@supabase/supabase-js";

const normalizeEnvValue = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/^['"]|['"]$/g, "") || undefined;
};

export function getSupabaseAdminClient() {
  const url =
    normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
    normalizeEnvValue(process.env.SUPABASE_URL);
  const serviceRoleKey = normalizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
