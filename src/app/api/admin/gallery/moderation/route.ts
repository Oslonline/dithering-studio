import { NextResponse } from "next/server";

import { requireActualAdminApi } from "../../../../../lib/auth/admin";
import { listGalleryItemsForModeration } from "../../../../../lib/gallery/queries";
import type { GalleryItemStatus } from "../../../../../lib/gallery/types";

const PAGE_SIZE_MAX = 50;

function parseStatus(value: string | null): GalleryItemStatus | null {
  if (value === "pending" || value === "approved" || value === "rejected") return value;
  return null;
}

export async function GET(request: Request) {
  const auth = await requireActualAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const url = new URL(request.url);
  const status = parseStatus(url.searchParams.get("status"));
  const offset = Math.max(0, Number.parseInt(url.searchParams.get("offset") ?? "0", 10) || 0);
  const limit = Math.min(
    PAGE_SIZE_MAX,
    Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "25", 10) || 25),
  );
  const search = url.searchParams.get("q")?.trim() ?? "";

  if (!status) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const { items, total } = await listGalleryItemsForModeration({
    status,
    limit,
    offset,
    search: search || undefined,
  });

  return NextResponse.json({
    items,
    total,
    offset,
    limit,
    hasMore: offset + items.length < total,
  });
}
