import { NextResponse } from "next/server";
import { readDB } from "../../../../lib/store";
import { isAdmin } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const db = await readDB();
  return NextResponse.json(db.activityLog || []);
}
