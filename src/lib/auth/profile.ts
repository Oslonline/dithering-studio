import type { User } from "@supabase/supabase-js";
import type { AccountProfile } from "./types";

type SupabaseLike = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: AccountProfile | null; error: { code?: string; message: string } | null }>;
      };
    };
    upsert: (values: Record<string, unknown>, options: { onConflict: string }) => {
      select: (columns: string) => {
        maybeSingle: () => Promise<{ data: AccountProfile | null; error: { code?: string; message: string } | null }>;
      };
    };
  };
};

const asSupabaseLike = (supabase: unknown): SupabaseLike => supabase as SupabaseLike;

export async function getProfile(supabase: unknown, userId: string) {
  const client = asSupabaseLike(supabase);
  return client.from("profiles").select("id, username, created_at, updated_at").eq("id", userId).maybeSingle();
}

export async function ensureProfileFromUser(supabase: unknown, user: User) {
  const client = asSupabaseLike(supabase);
  const existing = await getProfile(supabase, user.id);
  if (existing.data || existing.error?.code !== "PGRST116") {
    return existing;
  }

  const fallbackUsername =
    (user.user_metadata?.user_name as string | undefined) ||
    (user.user_metadata?.preferred_username as string | undefined) ||
    (user.email?.split("@")[0] ?? null);

  return client
    .from("profiles")
    .upsert(
      {
        id: user.id,
        username: fallbackUsername,
      },
      { onConflict: "id" },
    )
    .select("id, username, created_at, updated_at")
    .maybeSingle();
}
