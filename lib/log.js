// Basit aktivite günlüğü: DB içinde activityLog dizisinde tutulur, son 100 kayıt saklanır.
export function logActivity(db, message) {
  if (!db.activityLog) db.activityLog = [];
  db.activityLog.unshift({
    id: `a${Date.now()}`,
    message,
    ts: new Date().toISOString()
  });
  db.activityLog = db.activityLog.slice(0, 100);
}
