import { NextResponse } from "next/server";
import { readDB, writeDB } from "../../../../lib/store";
import { isAdmin } from "../../../../lib/auth";
import { logActivity } from "../../../../lib/log";

export const dynamic = "force-dynamic";

const ALLOWED = ["casinos", "streamers", "transactions", "reviews", "streamerReviews", "wallets", "kickChannels"];

export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { collection, ids, action, patch } = await req.json();
  if (!ALLOWED.includes(collection) || !Array.isArray(ids) || !ids.length) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  const db = await readDB();
  const set = new Set(ids);
  let affected = 0;

  if (action === "delete") {
    const before = db[collection].length;
    db[collection] = db[collection].filter((x) => !set.has(x.id));
    affected = before - db[collection].length;
    logActivity(db, `${affected} kayıt silindi (${collection})`);
  } else if (action === "patch" && patch) {
    for (const item of db[collection]) {
      if (set.has(item.id)) {
        Object.assign(item, patch);
        affected++;
      }
    }
    logActivity(db, `${affected} kayıt güncellendi (${collection}): ${JSON.stringify(patch)}`);
  } else {
    return NextResponse.json({ error: "Geçersiz eylem." }, { status: 400 });
  }

  await writeDB(db);
  return NextResponse.json({ ok: true, affected });
}
