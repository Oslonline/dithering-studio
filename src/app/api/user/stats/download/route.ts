import { NextResponse, type NextRequest } from "next/server";
import type { MediaDownloadKind } from "../../../../../lib/user/stats";
import { getSupabaseServerClient } from "../../../../../lib/supabase/server";

const VALID_KINDS = new Set<MediaDownloadKind>(["image", "svg", "video"]);

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { kind?: string };
  try {
    body = (await request.json()) as { kind?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const kind = body.kind as MediaDownloadKind;
  if (!VALID_KINDS.has(kind)) {
    return NextResponse.json({ error: "Invalid kind." }, { status: 400 });
  }

  const { data: row, error: readError } = await supabase
    .from("profiles")
    .select("media_downloads_total, image_downloads, video_downloads")
    .eq("id", user.id)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: "Could not read profile." }, { status: 500 });
  }

  const counts = {
    media_downloads_total: (row?.media_downloads_total ?? 0) + 1,
    image_downloads: (row?.image_downloads ?? 0) + (kind === "image" || kind === "svg" ? 1 : 0),
    video_downloads: (row?.video_downloads ?? 0) + (kind === "video" ? 1 : 0),
    last_download_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase.from("profiles").update(counts).eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: "Could not update stats." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ...counts });
}
