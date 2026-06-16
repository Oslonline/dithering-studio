import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_USER_PREVIEW_COOKIE } from "../../../../lib/auth/adminPreview";

import { isActualAdmin, isAdminUserPreviewEnabled } from "../../../../lib/auth/admin";



const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;



export async function GET() {

  if (!(await isActualAdmin())) {

    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  }



  const enabled = await isAdminUserPreviewEnabled();

  return NextResponse.json({ enabled });

}



export async function POST(request: NextRequest) {

  if (!(await isActualAdmin())) {

    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  }



  let body: { enabled?: boolean };

  try {

    body = (await request.json()) as { enabled?: boolean };

  } catch {

    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  }



  if (typeof body.enabled !== "boolean") {

    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  }



  const response = NextResponse.json({ enabled: body.enabled });

  response.cookies.set(ADMIN_USER_PREVIEW_COOKIE, body.enabled ? "1" : "0", {

    path: "/",

    maxAge: ONE_YEAR_SECONDS,

    sameSite: "lax",

    httpOnly: true,

    secure: process.env.NODE_ENV === "production",

  });



  return response;

}


