import { NextResponse, type NextRequest } from "next/server";
import { isCurrentUserAdmin } from "../../../../lib/auth/admin";
import { getSupabaseAdminClient } from "../../../../lib/supabase/admin";

export async function POST(request: NextRequest) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  let body: { itemId?: string; action?: "approve" | "reject" };
  try {
    body = (await request.json()) as { itemId?: string; action?: "approve" | "reject" };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const itemId = body.itemId?.trim();
  const action = body.action;
  if (!itemId || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "Invalid moderation action." }, { status: 400 });
  }

  const status = action === "approve" ? "approved" : "rejected";

  const { error } = await admin.from("gallery_items").update({ status }).eq("id", itemId).eq("status", "pending");

  if (error) {
    console.error("[gallery/moderate] update failed:", error.message);
    return NextResponse.json({ error: "Could not update item." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status });
}
