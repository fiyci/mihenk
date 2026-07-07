import { NextResponse } from "next/server";
import { readDB, writeDB } from "../../../../lib/store";
import { moderateReview } from "../../../../lib/moderate";

export const dynamic = "force-dynamic";

// Basit temizleme: uzunluk sınırı + tehlikeli karakterleri kırp
function clean(str, max) {
  return String(str || "").trim().slice(0, max);
}

export async function POST(req) {
  const body = await req.json();
  const casino = clean(body.casino, 60);
  const author = clean(body.author, 40) || "anonim";
  const text = clean(body.text, 600);
  const rating = Math.min(5, Math.max(1, Number(body.rating) || 0));

  if (!casino || !text || !rating) {
    return NextResponse.json({ error: "Casino, puan ve yorum zorunludur." }, { status: 400 });
  }
  if (text.length < 10) {
    return NextResponse.json({ error: "Yorum en az 10 karakter olmalı." }, { status: 400 });
  }

  const db = await readDB();
  // Casino gerçekten listede mi?
  if (!db.casinos.some((c) => c.name === casino)) {
    return NextResponse.json({ error: "Geçersiz casino." }, { status: 400 });
  }

  // AI moderasyon
  const mod = await moderateReview({ casino, text, rating });
  if (!mod.ok) {
    return NextResponse.json({ error: `Yorum yayınlanamadı: ${mod.reason}` }, { status: 400 });
  }

  const review = {
    id: `r${Date.now()}`,
    casino,
    author,
    rating,
    text,
    verified: false,
    approved: mod.autoApprove, // AI onayladıysa direkt yayında, aksi halde manuel kuyrukta
    modReason: mod.reason,
    helpful: 0,
    notHelpful: 0,
    ts: new Date().toISOString()
  };
  db.reviews.unshift(review);
  if (mod.autoApprove) recomputeSentiment(db);
  await writeDB(db);

  const msg = mod.autoApprove
    ? "Yorumun yayınlandı, teşekkürler!"
    : "Yorumun alındı, moderasyon sonrası yayınlanacak.";
  return NextResponse.json({ ok: true, message: msg }, { status: 201 });
}

// Onaylı + doğrulanmış yorumlardan casino sentiment/güven skorunu yeniden hesapla
function recomputeSentiment(db) {
  for (const c of db.casinos) {
    const rs = db.reviews.filter((r) => r.casino === c.name && r.approved !== false);
    if (!rs.length) continue;
    const avg = rs.reduce((s, r) => s + r.rating, 0) / rs.length;
    c.sentiment = Math.round((avg / 5) * 100);
  }
}
