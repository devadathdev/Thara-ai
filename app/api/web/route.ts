export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/local-auth";
import { browseUrl, webSearch } from "@/lib/web-browser";

export async function POST(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const body = await req.json();
    const action = body.action === "open" ? "open" : body.action === "search" ? "search" : "";
    if (!action) return NextResponse.json({ error: "action must be search or open" }, { status: 400 });

    if (action === "search") {
      const query = typeof body.query === "string" ? body.query.trim() : "";
      if (!query || query.length > 2000) return NextResponse.json({ error: "Invalid search query" }, { status: 400 });
      const result = await webSearch(query);
      return NextResponse.json({ ok: true, user: user.uid, ...result }, { headers: { "Cache-Control": "no-store" } });
    }

    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });
    const page = await browseUrl(url);
    return NextResponse.json({ ok: true, user: user.uid, page }, { headers: { "Cache-Control": "no-store" } });
  } catch (error:any) {
    console.error("web_api_error", error?.message || error);
    return NextResponse.json({ error: "Web browsing unavailable" }, { status: 502 });
  }
}
