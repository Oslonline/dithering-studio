import { NextResponse, type NextRequest } from "next/server";
import { GALLERY_PREVIEW_BUCKET, GALLERY_SETTINGS_VERSION, type GallerySettingsV1 } from "../../../../lib/gallery/types";
import { checkPublishRateLimit, hashIp, logPublishEvent } from "../../../../lib/gallery/rateLimit";
import { isGalleryDescriptionAllowed, sanitizeGalleryDescription } from "../../../../lib/gallery/sanitize";
import { shouldAutoApproveGalleryPublish } from "../../../../lib/auth/admin";
import { ensureProfileFromUser } from "../../../../lib/auth/profile";
import { getSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { getSupabaseServerClient } from "../../../../lib/supabase/server";

const MAX_BYTES = 2 * 1024 * 1024;

function clientIp(request: NextRequest): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null
  );
}

function parseSettings(raw: string): GallerySettingsV1 | null {
  try {
    const parsed = JSON.parse(raw) as GallerySettingsV1;
    if (parsed?.version !== GALLERY_SETTINGS_VERSION) return null;
    if (typeof parsed.pattern !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();
  if (!supabase || !admin) {
    return NextResponse.json({ error: "Gallery is not configured." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to publish." }, { status: 401 });
  }

  await ensureProfileFromUser(supabase, user);

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.username?.trim()) {
    return NextResponse.json({ error: "username_required" }, { status: 400 });
  }

  const ipHash = hashIp(clientIp(request));
  const rate = await checkPublishRateLimit(user.id, ipHash);
  if (!rate.ok) {
    return NextResponse.json({ error: rate.error }, { status: 429 });
  }

  const form = await request.formData();
  const settingsRaw = String(form.get("settings") ?? "");
  const descriptionRaw = String(form.get("description") ?? "");
  const resultFile = form.get("result");
  const originalFile = form.get("original");
  const width = Number(form.get("width") ?? 0);
  const height = Number(form.get("height") ?? 0);

  const settings = parseSettings(settingsRaw);
  if (!settings) {
    return NextResponse.json({ error: "Invalid settings payload." }, { status: 400 });
  }

  if (!(resultFile instanceof File) || !(originalFile instanceof File)) {
    return NextResponse.json({ error: "Missing image files." }, { status: 400 });
  }

  if (resultFile.size > MAX_BYTES || originalFile.size > MAX_BYTES) {
    return NextResponse.json({ error: "Images must be under 2 MB each." }, { status: 400 });
  }

  const allowedTypes = new Set(["image/webp", "image/png", "image/jpeg", "image/gif"]);
  const resultType =
    resultFile.type ||
    (settings.mode === "video" ? "image/gif" : "image/webp");
  const originalType = originalFile.type || "image/webp";
  if (!allowedTypes.has(resultType) || !allowedTypes.has(originalType)) {
    return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
  }

  const descriptionCheck = isGalleryDescriptionAllowed(descriptionRaw);
  if (!descriptionCheck.ok) {
    return NextResponse.json({ error: descriptionCheck.reason }, { status: 400 });
  }
  const description = sanitizeGalleryDescription(descriptionRaw) || null;

  const itemId = crypto.randomUUID();
  const resultExt = resultType === "image/gif" ? "gif" : "webp";
  const previewPath = `${user.id}/${itemId}/result.${resultExt}`;
  const originalPath = `${user.id}/${itemId}/original.webp`;
  const autoTitle = `${profile.username} · ${new Date().toISOString().slice(0, 10)}`;

  const uploadResult = await admin.storage.from(GALLERY_PREVIEW_BUCKET).upload(previewPath, resultFile, {
    contentType: resultType,
    upsert: false,
  });
  if (uploadResult.error) {
    console.error("[gallery/publish] result upload failed:", uploadResult.error.message);
    const detail =
      process.env.NODE_ENV === "development" ? uploadResult.error.message : undefined;
    return NextResponse.json(
      { error: detail ? `Could not store result image: ${detail}` : "Could not store result image." },
      { status: 500 },
    );
  }

  const uploadOriginal = await admin.storage.from(GALLERY_PREVIEW_BUCKET).upload(originalPath, originalFile, {
    contentType: originalType,
    upsert: false,
  });
  if (uploadOriginal.error) {
    await admin.storage.from(GALLERY_PREVIEW_BUCKET).remove([previewPath]);
    return NextResponse.json({ error: "Could not store original image." }, { status: 500 });
  }

  const status = (await shouldAutoApproveGalleryPublish(profile.role ?? "user")) ? "approved" : "pending";

  const { error: insertError } = await admin.from("gallery_items").insert({
    id: itemId,
    author_id: user.id,
    title: autoTitle,
    description,
    settings,
    settings_version: settings.version,
    preview_path: previewPath,
    original_path: originalPath,
    preview_width: width > 0 ? width : null,
    preview_height: height > 0 ? height : null,
    status,
    is_public: true,
  });

  if (insertError) {
    console.error("[gallery/publish] insert failed:", insertError.message, insertError.code);
    await admin.storage.from(GALLERY_PREVIEW_BUCKET).remove([previewPath, originalPath]);
    const detail =
      process.env.NODE_ENV === "development" ? insertError.message : undefined;
    return NextResponse.json(
      { error: detail ? `Could not create gallery entry: ${detail}` : "Could not create gallery entry." },
      { status: 500 },
    );
  }

  await logPublishEvent(user.id, itemId, ipHash);

  return NextResponse.json({
    ok: true,
    id: itemId,
    status,
    pending: status === "pending",
  });
}
