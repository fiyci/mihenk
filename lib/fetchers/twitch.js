// Twitch Helix API'sinden "Slots" kategorisindeki canlı yayınları çeker.
// Gerekli env: TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET
// Uygulama oluşturma: https://dev.twitch.tv/console/apps (ücretsiz)

let cachedToken = null;
let tokenExpiry = 0;

async function getTwitchToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error(`Twitch token hatası: ${res.status}`);
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

// Yayın başlığında bilinen casino adı geçiyorsa sponsor olarak eşleştir.
function detectCasino(title, casinoNames) {
  const lower = (title || "").toLowerCase();
  return casinoNames.find((n) => lower.includes(n.toLowerCase())) || "";
}

export async function fetchTwitchStreamers({ gameId, maxStreams }, casinoNames) {
  if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
    return { ok: false, reason: "TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET tanımlı değil", streamers: [] };
  }
  const token = await getTwitchToken();
  const res = await fetch(
    `https://api.twitch.tv/helix/streams?game_id=${gameId}&first=${Math.min(maxStreams || 50, 100)}`,
    {
      headers: {
        "Client-Id": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`
      }
    }
  );
  if (!res.ok) throw new Error(`Twitch streams hatası: ${res.status}`);
  const data = await res.json();
  const streamers = (data.data || []).map((s) => ({
    id: `tw_${s.user_id}`,
    handle: s.user_name,
    platform: "Twitch",
    casino: detectCasino(s.title, casinoNames),
    title: s.title || "",
    viewers: s.viewer_count || 0,
    live: true,
    source: "auto"
  }));
  return { ok: true, streamers };
}
