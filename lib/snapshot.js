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
    casinos: db.casinos.map((c) => ({ name: c.name, volume7d: c.volume7d, sentiment: c.sentiment })),
    streamers: db.streamers.map((s) => ({ handle: s.handle, viewers: s.viewers || 0, live: !!s.live }))
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

// Yükselen yayıncılar: en eski snapshot ile en yeni arasındaki izleyici artışı.
// TwitchTracker tarzı büyüme trendi. Yeterli veri yoksa boş döner.
export function risingStreamers(db, limit = 5) {
  const snaps = db.snapshots || [];
  if (snaps.length < 2) return [];
  const newest = snaps[0].streamers || [];
  const oldest = snaps[snaps.length - 1].streamers || [];
  const oldMap = new Map(oldest.map((s) => [s.handle, s.viewers]));

  const growth = newest
    .map((s) => {
      const before = oldMap.get(s.handle);
      if (before == null || before === 0) return null;
      const change = ((s.viewers - before) / before) * 100;
      return { handle: s.handle, now: s.viewers, before, change: Math.round(change) };
    })
    .filter(Boolean)
    .filter((s) => s.change !== 0)
    .sort((a, b) => b.change - a.change);

  return growth.slice(0, limit);
}

// --- Casino metrikleri: all-time-high, 30 günlük ortalama, sıralama ---
export function casinoMetrics(db, casinoName) {
  const snaps = db.snapshots || [];
  const points = snaps
    .map((s) => (s.casinos || []).find((c) => c.name === casinoName))
    .filter(Boolean)
    .map((c) => c.volume7d || 0);

  if (!points.length) {
    // veri yok — mevcut casino kaydından tek nokta
    const c = db.casinos.find((x) => x.name === casinoName);
    const v = c?.volume7d || 0;
    return { ath: v, avg30: v, current: v, dataPoints: 0 };
  }
  const ath = Math.max(...points);
  const avg30 = Math.round(points.reduce((a, b) => a + b, 0) / points.length);
  const current = points[0]; // en yeni snapshot en başta
  return { ath, avg30, current, dataPoints: points.length };
}

// Tüm casinoları hacme göre sırala, verilen casinonun sırasını bul
export function casinoRank(db, casinoName) {
  const sorted = [...db.casinos].sort((a, b) => (b.volume7d || 0) - (a.volume7d || 0));
  const idx = sorted.findIndex((c) => c.name === casinoName);
  return idx === -1 ? null : idx + 1;
}

// --- Aktivite ısı haritası: gün (0=Pzt..6=Paz) × saat (0-23) ---
// Snapshot'lardaki liveStreamers/totalVolume'u zaman damgasına göre kovalar.
export function activityHeatmap(db) {
  const snaps = db.snapshots || [];
  // 7x24 matris, her hücre o gün/saatteki ortalama canlı yayıncı sayısı
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  const counts = Array.from({ length: 7 }, () => Array(24).fill(0));

  for (const s of snaps) {
    const d = new Date(s.ts);
    if (isNaN(d)) continue;
    const day = (d.getUTCDay() + 6) % 7; // Pazartesi=0
    const hour = d.getUTCHours();
    grid[day][hour] += s.liveStreamers || 0;
    counts[day][hour]++;
  }
  let max = 0;
  for (let day = 0; day < 7; day++)
    for (let h = 0; h < 24; h++) {
      if (counts[day][h]) grid[day][h] = Math.round(grid[day][h] / counts[day][h]);
      if (grid[day][h] > max) max = grid[day][h];
    }
  return { grid, max, hasData: snaps.length > 0 };
}

// Yükselen/düşen casinolar (en eski vs en yeni snapshot hacim değişimi)
export function movingCasinos(db, limit = 5) {
  const snaps = db.snapshots || [];
  if (snaps.length < 2) return [];
  const newest = new Map((snaps[0].casinos || []).map((c) => [c.name, c.volume7d]));
  const oldest = new Map((snaps[snaps.length - 1].casinos || []).map((c) => [c.name, c.volume7d]));
  const out = [];
  for (const [name, nv] of newest) {
    const ov = oldest.get(name);
    if (ov == null || ov === 0) continue;
    const change = Math.round(((nv - ov) / ov) * 100);
    if (change !== 0) out.push({ name, change, now: nv });
  }
  return out.sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, limit);
}

// --- Yayıncı metrikleri: zirve izleyici, ortalama, sıra ---
export function streamerMetrics(db, handle) {
  const snaps = db.snapshots || [];
  const points = snaps
    .map((s) => (s.streamers || []).find((x) => x.handle === handle))
    .filter(Boolean)
    .map((x) => x.viewers || 0);

  if (!points.length) {
    const s = db.streamers.find((x) => x.handle === handle);
    const v = s?.viewers || 0;
    return { peak: v, avg: v, current: v, dataPoints: 0 };
  }
  const peak = Math.max(...points);
  const avg = Math.round(points.reduce((a, b) => a + b, 0) / points.length);
  return { peak, avg, current: points[0], dataPoints: points.length };
}

export function streamerRank(db, handle) {
  const sorted = [...db.streamers].sort((a, b) => (b.viewers || 0) - (a.viewers || 0));
  const idx = sorted.findIndex((s) => s.handle === handle);
  return idx === -1 ? null : idx + 1;
}

// Belirli bir yayıncı için gün×saat ısı haritası (canlı olduğu saatler)
export function streamerHeatmap(db, handle) {
  const snaps = db.snapshots || [];
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  const counts = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const s of snaps) {
    const st = (s.streamers || []).find((x) => x.handle === handle);
    if (!st) continue;
    const d = new Date(s.ts);
    if (isNaN(d)) continue;
    const day = (d.getUTCDay() + 6) % 7;
    const hour = d.getUTCHours();
    grid[day][hour] += st.live ? (st.viewers || 1) : 0;
    counts[day][hour]++;
  }
  let max = 0;
  for (let d = 0; d < 7; d++)
    for (let h = 0; h < 24; h++) {
      if (counts[d][h]) grid[d][h] = Math.round(grid[d][h] / counts[d][h]);
      if (grid[d][h] > max) max = grid[d][h];
    }
  return { grid, max, hasData: snaps.length > 0 };
}

// Yayıncı izleyici zaman serisi (grafik için)
export function streamerSeries(db, handle) {
  return (db.snapshots || [])
    .slice()
    .reverse()
    .map((s) => {
      const st = (s.streamers || []).find((x) => x.handle === handle);
      return { ts: s.ts, volume: st?.viewers || 0 };
    });
}
