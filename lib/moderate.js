// AI yorum moderasyonu: gelen oyuncu yorumunu Anthropic API'den geçirir.
// Spam, hakaret, alakasız içerik veya manipülasyon tespit ederse reddeder.
// ANTHROPIC_API_KEY tanımlı değilse moderasyon atlanır (yorum manuel kuyruğa düşer).

export async function moderateReview({ casino, text, rating }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: true, autoApprove: false, reason: "AI moderasyon kapalı (ANTHROPIC_API_KEY yok) — manuel kuyruğa alındı" };
  }

  const prompt = `Bir online casino inceleme platformu için yorum moderatörüsün. Aşağıdaki oyuncu yorumunu değerlendir.

Casino: ${casino}
Puan: ${rating}/5
Yorum: "${text}"

Şu kriterlere göre karar ver:
- Hakaret, küfür, nefret söylemi içeriyor mu?
- Spam, reklam, alakasız link içeriyor mu?
- Casino deneyimiyle tamamen alakasız mı?
- Açıkça sahte/manipülatif mi (ör. anlamsız övgü/karalama)?

Sadece şu JSON formatında yanıt ver, başka hiçbir şey yazma:
{"decision": "approve" veya "reject", "reason": "kısa Türkçe gerekçe"}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!res.ok) {
      return { ok: true, autoApprove: false, reason: `Moderasyon API hatası (${res.status}) — manuel kuyruğa alındı` };
    }
    const data = await res.json();
    const textOut = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
    const clean = textOut.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    if (parsed.decision === "reject") {
      return { ok: false, autoApprove: false, reason: parsed.reason || "İçerik politikasına uygun değil" };
    }
    return { ok: true, autoApprove: true, reason: parsed.reason || "Onaylandı" };
  } catch (e) {
    // Hata olursa güvenli taraf: reddetme, manuel kuyruğa al
    return { ok: true, autoApprove: false, reason: "Moderasyon çözümlenemedi — manuel kuyruğa alındı" };
  }
}
