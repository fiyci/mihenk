// Kick resmi API'sinden takip listesindeki kanalların canlı durumunu çeker.
// Gerekli env: KICK_CLIENT_ID, KICK_CLIENT_SECRET
// Uygulama oluşturma: Kick hesap ayarları → Developer (docs.kick.com)

let cachedToken = null;
let tokenExpiry = 0;

async function getKickToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.KICK_CLIENT_ID,
    client_secret: process.env.KICK_CLIENT_SECRET
  });
  const res = await fetch("https://id.kick.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) throw new Error(`Kick token hatası: ${res.status}`);
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

function detectCasino(title, casinoNames) {
  const lower = (title || "").toLowerCase();
  return casinoNames.find((n) => lower.includes(n.toLowerCase())) || "";
}

export async function fetchKickStreamers({ channels }, casinoNames) {
  if (!process.env.KICK_CLIENT_ID || !process.env.KICK_CLIENT_SECRET) {
    return { ok: false, reason: "KICK_CLIENT_ID / KICK_CLIENT_SECRET tanımlı değil", streamers: [] };
  }
  if (!channels?.length) return { ok: true, streamers: [] };

  const token = await getKickToken();
  const qs = channels.map((s) => `slug=${encodeURIComponent(s)}`).join("&");
  const res = await fetch(`https://api.kick.com/public/v1/channels?${qs}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Kick channels hatası: ${res.status}`);
  const data = await res.json();

  const streamers = (data.data || []).map((c) => ({
    id: `kc_${c.broadcaster_user_id || c.slug}`,
    handle: c.slug,
    platform: "Kick",
    casino: detectCasino(c.stream_title, casinoNames),
    title: c.stream_title || "",
    viewers: c.stream?.viewer_count || 0,
    live: Boolean(c.stream?.is_live),
    source: "auto"
  }));
  return { ok: true, streamers };
}
