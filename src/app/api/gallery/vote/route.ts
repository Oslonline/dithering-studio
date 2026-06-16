import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { getSupabaseServerClient } from "../../../../lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Gallery is not configured." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to vote." }, { status: 401 });
  }

  let body: { itemId?: string; vote?: number };
  try {
    body = (await request.json()) as { itemId?: string; vote?: number };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const itemId = body.itemId?.trim();
  const vote = body.vote;
  if (!itemId || (vote !== 1 && vote !== -1)) {
    return NextResponse.json({ error: "Invalid vote." }, { status: 400 });
  }

  const { data: item, error: itemError } = await supabase
    .from("gallery_items")
    .select("id, author_id, status")
    .eq("id", itemId)
    .eq("status", "approved")
    .maybeSingle();

  if (itemError || !item) {
    return NextResponse.json({ error: "Gallery item not found." }, { status: 404 });
  }

  if (item.author_id === user.id) {
    return NextResponse.json({ error: "You cannot vote on your own post." }, { status: 400 });
  }

  const { error: voteError } = await supabase.from("gallery_votes").upsert(
    {
      user_id: user.id,
      gallery_item_id: itemId,
      vote,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,gallery_item_id" },
  );

  if (voteError) {
    console.error("[gallery/vote] upsert failed:", voteError.message, voteError.code);
    return NextResponse.json({ error: "Could not save vote." }, { status: 500 });
  }

  const admin = getSupabaseAdminClient();
  const countClient = admin ?? supabase;
  const { data: refreshed, error: refreshError } = await countClient
    .from("gallery_items")
    .select("upvote_count, downvote_count")
    .eq("id", itemId)
    .maybeSingle();

  if (refreshError) {
    console.error("[gallery/vote] count refresh failed:", refreshError.message);
  }

  return NextResponse.json({
    ok: true,
    vote,
    upvote_count: refreshed?.upvote_count ?? 0,
    downvote_count: refreshed?.downvote_count ?? 0,
  });
}
