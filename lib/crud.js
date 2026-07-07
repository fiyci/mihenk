import { NextResponse } from "next/server";
import { readDB, writeDB } from "./store";
import { isAdmin } from "./auth";
import { logActivity } from "./log";

export function makeCrud(collection) {
  return {
    async GET() {
      const db = await readDB();
      return NextResponse.json(db[collection] || []);
    },
    async POST(req) {
      if (!isAdmin()) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
      const body = await req.json();
      const db = await readDB();
      if (!db[collection]) db[collection] = [];
      const item = { id: `${collection[0]}${Date.now()}`, ...body };
      db[collection].push(item);
      logActivity(db, `Yeni kayıt eklendi (${collection}): ${item.name || item.handle || item.slug || item.casino || item.id}`);
      await writeDB(db);
      return NextResponse.json(item, { status: 201 });
    },
    async PUT(req) {
      if (!isAdmin()) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
      const body = await req.json();
      const db = await readDB();
      const i = (db[collection] || []).findIndex((x) => x.id === body.id);
      if (i === -1) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
      db[collection][i] = { ...db[collection][i], ...body };
      logActivity(db, `Kayıt güncellendi (${collection}): ${db[collection][i].name || db[collection][i].handle || db[collection][i].id}`);
      await writeDB(db);
      return NextResponse.json(db[collection][i]);
    },
    async DELETE(req) {
      if (!isAdmin()) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
      const { id } = await req.json();
      const db = await readDB();
      const removed = (db[collection] || []).find((x) => x.id === id);
      db[collection] = (db[collection] || []).filter((x) => x.id !== id);
      logActivity(db, `Kayıt silindi (${collection}): ${removed?.name || removed?.handle || id}`);
      await writeDB(db);
      return NextResponse.json({ ok: true });
    }
  };
}
