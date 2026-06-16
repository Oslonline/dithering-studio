const normalizeEnvValue = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const unquoted = trimmed.replace(/^['"]|['"]$/g, "");
  return unquoted || undefined;
};

// Direct process.env access is required so Next.js inlines NEXT_PUBLIC_* in client bundles.
const PUBLIC_SUPABASE_URL = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
const PUBLIC_SUPABASE_PUBLISHABLE_KEY = normalizeEnvValue(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const SERVER_SUPABASE_URL = normalizeEnvValue(process.env.SUPABASE_URL) ?? PUBLIC_SUPABASE_URL;
const SERVER_SUPABASE_PUBLISHABLE_KEY =
  normalizeEnvValue(process.env.SUPABASE_PUBLISHABLE_KEY) ??
  normalizeEnvValue(process.env.SUPABASE_KEY) ??
  normalizeEnvValue(process.env.SUPABASE_ANON_KEY) ??
  PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const toConfig = (url: string | undefined, key: string | undefined) => {
  if (!url || !key) {
    return null;
  }
  return { url, anonKey: key };
};

export const getSupabaseClientConfig = () => toConfig(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY);
export const getSupabaseServerConfig = () => toConfig(SERVER_SUPABASE_URL, SERVER_SUPABASE_PUBLISHABLE_KEY);

export const hasSupabaseClientConfig = (): boolean => getSupabaseClientConfig() !== null;
export const hasSupabaseServerConfig = (): boolean => getSupabaseServerConfig() !== null;
