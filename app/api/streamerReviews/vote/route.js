import { NextResponse } from "next/server";
import { readDB, writeDB } from "../../../../lib/store";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const { id, kind } = await req.json();
  if (!id || !["helpful", "notHelpful"].includes(kind)) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  const db = await readDB();
  const r = (db.streamerReviews || []).find((x) => x.id === id);
  if (!r) return NextResponse.json({ error: "Yorum bulunamadı." }, { status: 404 });
  r[kind] = (r[kind] || 0) + 1;
  await writeDB(db);
  return NextResponse.json({ ok: true, helpful: r.helpful, notHelpful: r.notHelpful });
}
