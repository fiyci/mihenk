// Snapshot sistemi: cron her çalıştığında toplam hacim + casino başına hacmi
// tarih damgasıyla kaydeder. Grafikler bu seriden beslenir.
// Son 90 gün / 500 kayıt tutulur (fazlası budanır).

export function takeSnapshot(db) {
  if (!db.snapshots) db.snapshots = [];
  const now = new Date().toISOString();
  const totalVolume = db.transactions
    .filter((t) => t.type === "deposit")
    .reduce((s, t) => s + (t.amountUsd || 0), 0);
  const liveStreamers = db.streamers.filter((s) => s.live).length;

  db.snapshots.unshift({
    id: `snap${Date.now()}`,
    ts: now,
    totalVolume,
    liveStreamers,
    casinos: db.casinos.map((c) => ({ name: c.name, volume7d: c.volume7d, sentiment: c.sentiment }))
  });

  // Aynı gün içinde en fazla saatte 1 snapshot tut (gürültüyü azalt)
  const seen = new Set();
  db.snapshots = db.snapshots.filter((s) => {
    const hourKey = s.ts.slice(0, 13); // YYYY-MM-DDTHH
    if (seen.has(hourKey)) return false;
    seen.add(hourKey);
    return true;
  });

  db.snapshots = db.snapshots.slice(0, 500);
}

// Bir casino için zaman serisi çıkar (grafik için, eskiden yeniye)
export function seriesForCasino(db, casinoName) {
  return (db.snapshots || [])
    .slice()
    .reverse()
    .map((s) => {
      const c = (s.casinos || []).find((x) => x.name === casinoName);
      return { ts: s.ts, volume: c?.volume7d || 0 };
    });
}

export function totalVolumeSeries(db) {
  return (db.snapshots || [])
    .slice()
    .reverse()
    .map((s) => ({ ts: s.ts, volume: s.totalVolume }));
}
