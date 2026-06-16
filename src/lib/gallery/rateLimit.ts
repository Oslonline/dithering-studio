import { createHash } from "crypto";
import { getSupabaseAdminClient } from "../supabase/admin";

const HOURLY_LIMIT = 3;
const DAILY_LIMIT = 10;
const COOLDOWN_MS = 30_000;

export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const secret = process.env.GALLERY_RATE_LIMIT_SECRET ?? "local-dev";
  return createHash("sha256").update(`${secret}:${ip}`).digest("hex");
}

export async function checkPublishRateLimit(userId: string, ipHash: string | null) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return { ok: false as const, error: "Gallery publishing is unavailable." };
  }

  const now = Date.now();
  const hourAgo = new Date(now - 60 * 60 * 1000).toISOString();
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  const { count: hourCount } = await admin
    .from("gallery_publish_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", hourAgo);

  if ((hourCount ?? 0) >= HOURLY_LIMIT) {
    return { ok: false as const, error: "Publish limit reached. Try again in an hour." };
  }

  const { count: dayCount } = await admin
    .from("gallery_publish_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", dayAgo);

  if ((dayCount ?? 0) >= DAILY_LIMIT) {
    return { ok: false as const, error: "Daily publish limit reached. Try again tomorrow." };
  }

  const { data: lastEvent } = await admin
    .from("gallery_publish_log")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastEvent?.created_at) {
    const elapsed = now - new Date(lastEvent.created_at).getTime();
    if (elapsed < COOLDOWN_MS) {
      return { ok: false as const, error: "Please wait a moment before publishing again." };
    }
  }

  if (ipHash) {
    const { count: ipHourCount } = await admin
      .from("gallery_publish_log")
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", hourAgo);

    if ((ipHourCount ?? 0) >= HOURLY_LIMIT * 2) {
      return { ok: false as const, error: "Too many publish attempts from this network." };
    }
  }

  return { ok: true as const };
}

export async function logPublishEvent(userId: string, galleryItemId: string, ipHash: string | null) {
  const admin = getSupabaseAdminClient();
  if (!admin) return;
  await admin.from("gallery_publish_log").insert({
    user_id: userId,
    gallery_item_id: galleryItemId,
    ip_hash: ipHash,
  });
}
