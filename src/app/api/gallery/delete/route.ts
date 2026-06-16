import { NextResponse, type NextRequest } from "next/server";
import { isCurrentUserAdmin } from "../../../../lib/auth/admin";
import { GALLERY_PREVIEW_BUCKET } from "../../../../lib/gallery/types";
import { getSupabaseAdminClient } from "../../../../lib/supabase/admin";

export async function POST(request: NextRequest) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Gallery is not configured." }, { status: 503 });
  }

  let body: { itemId?: string };
  try {
    body = (await request.json()) as { itemId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const itemId = body.itemId?.trim();
  if (!itemId) {
    return NextResponse.json({ error: "Missing gallery item id." }, { status: 400 });
  }

  const { data: item, error: fetchError } = await admin
    .from("gallery_items")
    .select("id, preview_path, original_path")
    .eq("id", itemId)
    .maybeSingle();

  if (fetchError || !item) {
    return NextResponse.json({ error: "Gallery item not found." }, { status: 404 });
  }

  const storagePaths = [item.preview_path, item.original_path].filter(
    (path): path is string => typeof path === "string" && path.length > 0,
  );

  if (storagePaths.length) {
    const { error: storageError } = await admin.storage.from(GALLERY_PREVIEW_BUCKET).remove(storagePaths);
    if (storageError) {
      console.error("[gallery/delete] storage remove failed:", storageError.message);
    }
  }

  const { error: deleteError } = await admin.from("gallery_items").delete().eq("id", itemId);
  if (deleteError) {
    console.error("[gallery/delete] row delete failed:", deleteError.message);
    return NextResponse.json({ error: "Could not delete gallery item." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
